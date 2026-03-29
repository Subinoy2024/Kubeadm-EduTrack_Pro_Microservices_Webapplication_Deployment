#!/usr/bin/env python3
import os
from pathlib import Path

IMAGE_REGISTRY = os.getenv('IMAGE_REGISTRY')
IMAGE_TAG = os.getenv('IMAGE_TAG')

if not IMAGE_REGISTRY or not IMAGE_TAG:
    raise SystemExit('IMAGE_REGISTRY and IMAGE_TAG environment variables are required')

base = Path('deploy/kubeadm')
if base.exists():
    for path in base.glob('*.yaml'):
        text = path.read_text()
        updated = text.replace('YOUR_IMAGE_REGISTRY', IMAGE_REGISTRY).replace('YOUR_IMAGE_TAG', IMAGE_TAG)
        if updated != text:
            path.write_text(updated)
            print(f'Updated image values in {path}')
