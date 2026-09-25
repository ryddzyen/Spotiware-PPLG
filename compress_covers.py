"""
Kompres semua gambar di folder "Art Cover" jadi WebP kecil (maks 400px)
dan simpan ke folder baru "Art Cover Compressed", tanpa mengubah folder asli.

Cara pakai:
1. Install Pillow kalau belum ada:
   pip install pillow
2. Taruh file ini SEJAJAR dengan folder "Art Cover" (folder Spotiware-mu).
3. Jalankan:
   python compress_covers.py
4. Setelah selesai, akan ada folder baru "Art Cover Compressed" berisi semua
   gambar dalam format .webp, ukurannya jauh lebih kecil.
"""

import os
from pathlib import Path
from PIL import Image

SRC_DIR = Path("Art Cover")
DST_DIR = Path("Art Cover Compressed")
MAX_SIZE = 400          # lebar/tinggi maksimum, cukup untuk kartu 8.5-10rem
QUALITY = 80            # kualitas webp, 75-85 biasanya sudah bagus

VALID_EXT = {".jpg", ".jpeg", ".png", ".webp"}


def compress_all():
    if not SRC_DIR.exists():
        print(f'Folder "{SRC_DIR}" tidak ditemukan. Jalankan skrip ini sejajar dengan folder itu.')
        return

    DST_DIR.mkdir(exist_ok=True)

    total_before = 0
    total_after = 0
    count = 0

    for file in sorted(SRC_DIR.iterdir()):
        if file.suffix.lower() not in VALID_EXT:
            continue

        try:
            with Image.open(file) as img:
                img = img.convert("RGB")
                img.thumbnail((MAX_SIZE, MAX_SIZE), Image.LANCZOS)

                out_path = DST_DIR / (file.stem + ".webp")
                img.save(out_path, "WEBP", quality=QUALITY, method=6)

                before = file.stat().st_size
                after = out_path.stat().st_size
                total_before += before
                total_after += after
                count += 1

                print(f"{file.name}  {before/1024:.0f}KB -> {after/1024:.0f}KB")

        except Exception as e:
            print(f"GAGAL: {file.name} ({e})")

    print("\n=== SELESAI ===")
    print(f"{count} gambar diproses")
    print(f"Total sebelum : {total_before/1024/1024:.2f} MB")
    print(f"Total sesudah : {total_after/1024/1024:.2f} MB")
    if total_before:
        print(f"Hemat         : {(1 - total_after/total_before)*100:.1f}%")


if __name__ == "__main__":
    compress_all()