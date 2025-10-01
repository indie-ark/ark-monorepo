# chronoperates-api TODO

- [ ] Path traversal vulnerability (src/main.py:100). Validate file_path or use file ID instead of exposing paths
- [ ] No linting configured (package.json:7). Add ruff check and format scripts
- [ ] MD5 used for cache keys (src/services/claude_service.py:33). Replace with SHA256 or BLAKE2
- [x] Hardcoded CORS origins (src/main.py:21-24). Move to settings with ALLOWED_ORIGINS env var
- [ ] Dockerfile CMD incorrect (Dockerfile:29). Change to use python -m or set PYTHONPATH
- [ ] No API key validation at startup (src/services/claude_service.py:16-19). Add startup check in main.py
- [ ] Incomplete temp file cleanup (src/main.py:87, src/services/ics_service.py:269). Use context managers or finally blocks
- [ ] Cache timestamp bug (src/services/claude_service.py:57). Fix Path().stat() to cache_file.stat()
- [ ] Missing type hints (src/services/ics_service.py:94). Add explicit Tuple[int, int] type hint
