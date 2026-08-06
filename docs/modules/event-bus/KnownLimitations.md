# Event Bus Infrastructure - Known Limitations

- Direct DOM element references cannot be serialized over Chrome Port bridges; payloads must be serializable JSON.
