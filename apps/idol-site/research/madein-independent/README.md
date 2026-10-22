# MADEIN independent record page — local integration

Design input: frozen independent board app.js SHA256 ba499058f83ad3a1385de3e54ed1b79a1355f7b67661995c1b3cf6cda463a2bb; standalone SHA256 6582f287def9d0d54d101fb2121461b119badef5888a057762d5594c922f1df7.

This is local source integration only, not publication or image upload. New JPGs retain source bytes, full aspect ratio and visible watermarks. Exact SHA256, source page/image, dimensions and period are in assets.json. The original hero, six portraits, JPG/WebP originals and all artist content records remain unchanged.

Public release mapping contains stable work IDs and public release facts only. Public test identities/works are selected public whitelist fields, with all scores and relationships generated synthetically in tests. No private snapshot or display-v1 response is stored here.

Runtime reads stay authenticated display-v1. Group directory uses artistCollection; member summaries use the full runtime memberWorks response. Four named members are 2026 Girl Meets Boy editorial entry points, not a current-status declaration. All runtime group members remain reachable. Valid GAEUN archive media remains supported. All editing goes to the existing editor with validated MADEIN return context; no save mutation is introduced.

The production timeline loader, host, identity checks and layout provider remain unchanged. Its original ready/hold events are not replaced by the design board.

Sources: https://sports.khan.co.kr/article/202602050507003 ; https://www.genie.co.kr/detail/albumInfo?axnm=87224259 ; https://www.madein-official.net/discography/ ; https://www.madein-official.net/profile/ . Public release facts were reviewed in the frozen design input; this integration does not claim new current-roster research.

## Display-only loading optimization

After the 4ff8931 browser baseline was frozen, three reviewed full-pixel WebP q95 / method=6 candidates were copied locally for the 2026 Girl Meets Boy press photos 01, 02 and 04. The exact mapping lives in madein-photo-display.ts; altered, query-bearing or unknown originals are not mapped. The original editorial image map, original JPEG bytes, image identity and lightbox JPEG source stay unchanged. Photo 03 is not rendered and has no display derivative here.

The encoder is Pillow with libwebp 1.6.0. These are lossy derivatives, not lossless copies: decoded pixels differ due to compression, without resizing, cropping, grading or sharpening. Native dimensions, full frame and watermark remain. Display payload for the three images is 1,248,542 bytes versus 3,262,328 JPEG bytes, saving 2,013,786 bytes (61.73%) when all are requested uncached. This is an encoded-byte comparison, not a measured LCP/network/decode-time or memory improvement. Per-image source URLs, source/display SHA256, sizes, encoder and local-use boundary are recorded in display-derivatives.json.
