import {
    Controller,
    Get,
    Query,
    Res,
    BadRequestException,
    HttpException,
} from '@nestjs/common';
import type {Response} from 'express';
import fetch from 'node-fetch';
import {Public} from "../auth/public.decorator"; // or use native fetch if Node 18+

// Allowlist of trusted ad domains — prevents your proxy being abused
const ALLOWED_HOSTS = [
    'i.imgur.com',
    'imgur.com',
    // add more as needed
];
@Public()
@Controller({path: 'media-proxy', version: '1'})
export class MediaProxyController {

    @Get()
    async proxy(
        @Query('url') url: string,
        @Res() res: Response,
    ) {
        if (!url) throw new BadRequestException('Missing url param');

        // Validate it's an allowed host
        let parsed: URL;
        try {
            parsed = new URL(url);
        } catch {
            throw new BadRequestException('Invalid URL');
        }

        const isAllowed = ALLOWED_HOSTS.some(host => parsed.hostname.endsWith(host));
        if (!isAllowed) {
            throw new BadRequestException(`Host ${parsed.hostname} is not allowlisted`);
        }

        // Fetch the media server-side (no CORS here)
        let upstream: Awaited<ReturnType<typeof fetch>>;
        try {
            upstream = await fetch(url, {
                headers: {
                    // Mimic a browser so hostile servers don't block bots
                    'User-Agent': 'Mozilla/5.0 (compatible; YourApp/1.0)',
                    'Accept': '*/*',
                },
            });
        } catch (e) {
            throw new HttpException('Failed to fetch upstream media', 502);
        }

        if (!upstream.ok) {
            throw new HttpException(
                `Upstream returned ${upstream.status}`,
                upstream.status,
            );
        }

        // Forward content-type so the client knows what it's receiving
        const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream';
        const contentLength = upstream.headers.get('content-length');

        res.setHeader('Content-Type', contentType);
        res.setHeader('Access-Control-Allow-Origin', '*'); // This is the key header Flutter Web needs
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
        if (contentLength) res.setHeader('Content-Length', contentLength);

        // Pipe the response stream directly — avoids buffering large videos in memory
        upstream.body.pipe(res);
    }
}