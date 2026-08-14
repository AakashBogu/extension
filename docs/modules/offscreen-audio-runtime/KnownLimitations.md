# Offscreen Audio Runtime - Known Limitations

- Offscreen API creation is governed by Manifest V3 background permissions (`offscreen`, `tabCapture`).
- AudioContext is kept in suspended state until real tab capture streams are attached in Module 3B.
