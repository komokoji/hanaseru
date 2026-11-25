#!/usr/bin/env python3
"""Build a private on-device lesson from local MP3 and timestamped transcript.
Usage: python3 ops/build-original-audio.py AUDIO LESSON_JSON OUTPUT.hanaseru.json
LESSON_JSON: {title, segments: [{start, end, text}]}. Outputs must stay under data/.
Requires ffmpeg. No network calls; does not modify the original files.
"""
import base64
import json
from pathlib import Path
import subprocess
import sys
import tempfile


def build(audio_path, lesson_path, output_path):
    root = Path(__file__).resolve().parents[1]
    output = Path(output_path).resolve()
    if not output.is_relative_to(root / 'data'):
        raise ValueError('Keep private lesson packages under this repository data/ directory.')
    source = Path(audio_path).resolve()
    lesson = json.loads(Path(lesson_path).read_text())
    segments = []
    end = 0
    with tempfile.TemporaryDirectory() as temp:
        for i, s in enumerate(lesson['segments']):
            if not (0 <= s['start'] >= end and s['end'] > s['start']):
                raise ValueError('Invalid segment boundaries')
            end = s['end']
            clip = Path(temp) / f'{i}.mp3'
            subprocess.run(['ffmpeg', '-v', 'error', '-i', str(source), '-ss', str(s['start']), '-t', str(s['end'] - s['start']), '-codec:a', 'libmp3lame', '-b:a', '64k', str(clip)], check=True)
            segments.append(dict(start=s['start'], end=s['end'], text=s['text'], audio=base64.b64encode(clip.read_bytes()).decode()))
    import hashlib
    package = dict(format='hanaseru-original-audio-v1', id='audio-' + hashlib.sha256(source.read_bytes()).hexdigest()[:20], title=lesson['title'], audio=base64.b64encode(source.read_bytes()).decode(), segments=segments)
    encoded = json.dumps(package, ensure_ascii=False)
    if len(encoded.encode()) > 12 * 1024 * 1024:
        raise ValueError('Package exceeds 12 MB; use a shorter source clip.')
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(encoded)
    print(f'Created {output} ({len(segments)} segments)')


if __name__ == '__main__':
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    build(*sys.argv[1:])
