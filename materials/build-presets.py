"""Writes assets/pace-presets.js from materials/presets.json (constructed transcripts, json.dumps only)."""
import json, os
here = os.path.dirname(os.path.abspath(__file__))
P = json.load(open(os.path.join(here, "presets.json")))
with open(os.path.join(here, "..", "assets", "pace-presets.js"), "w") as fh:
    fh.write("/* pace-presets.js - constructed transcripts of a fictional team lead's all-hands opening. Built by materials/build-presets.py. */\n")
    fh.write("window.PACE_PRESETS = " + json.dumps(P, ensure_ascii=True) + ";\n")
