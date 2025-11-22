from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import cadquery as cq
from pathlib import Path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Sheet metal generator is running!"}

@app.get("/bracket")
def bracket(length: float = 100.0, width: float = 50.0, thickness: float = 3.0):
    part = cq.Workplane("XY").box(length, width, thickness)
    Path("downloads").mkdir(exist_ok=True)
    cq.exporters.export(part, "downloads/bracket.step")
    cq.exporters.export(part.faces(">Z").workplane(), "downloads/bracket.dxf")
    return FileResponse("downloads/bracket.dxf", filename="L-Bracket.dxf")
