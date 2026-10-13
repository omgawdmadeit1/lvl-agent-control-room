# Control room v1 (static, read-only)

`node control-room-v1/build.mjs` probes every surface in `surfaces.json`, reads the x402 proof, and writes `dist/index.html` + `dist/data.json`.
Money rows live in `money.json`, and each row cites its source. Only `class: live` counts as revenue; `test` and `self_funded` are shown separately.
It's deployed as a static upload of `dist/` to lvl-agent-control-room.vercel.app. `control.lvlltd.com` would need a DNS change and Joseph's approval.
