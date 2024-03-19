pip install git+https://github.com/miurahr/pykakasi

#!/usr/bin/env python3
# coding: utf-8
import sys
from pykakasi import kakasi

kakasi = kakasi()

recieve = sys.stdin.readline()

result = kakasi.convert(recieve)

result = result[0]['hepburn']

print(result)  # これがJavaScriptに渡されます