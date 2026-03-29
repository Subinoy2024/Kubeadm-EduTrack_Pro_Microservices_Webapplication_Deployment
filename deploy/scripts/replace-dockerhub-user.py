#!/usr/bin/env python3
from pathlib import Path
import os

PLACEHOLDER_USER = 'YOUR_DOCKERHUB_USER'
registry = os.getenv('IMAGE_REGISTRY', '')
if not registry:
    raise SystemExit('IMAGE_REGISTRY environment variable is required')

base = Path('deploy/kubeadm')
if base.exists():
    for path in base.glob('*.yaml'):
        text = path.read_text()
        new_text = text.replace(PLACEHOLDER_USER, registry)
        if new_text != text:
            path.write_text(new_text)
            print(f'Updated registry placeholder in {path}')
