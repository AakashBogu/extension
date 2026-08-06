# Module 1A Implementation Notes

- Manifest V3 enforces background script execution as an ES Module Service Worker.
- Content Script mounts UI via Shadow DOM (`attachShadow({ mode: 'open' })`) to protect host website styles.
