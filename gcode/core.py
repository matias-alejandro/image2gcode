from .feedrate import Feedrate
from .unit import Unit

class GCode:
    def __init__(self, unit: Unit = Unit.MM):
        self.commands: list[str] = []
        self.commands.append(f"{unit} ; {unit.name}")
        self.commands.append("G90")

    def move_rapid(self, x: float | None = None, y: float | None = None, z: float | None = None):
        cmd = "G0"
        if x is not None:
            cmd += f" X{x:.2f}"
        if y is not None:
            cmd += f" Y{y:.2f}"
        if z is not None:
            cmd += f" Z{z:.2f}"
        self.commands.append(cmd)

    def move_linear(self, x: float | None = None, y: float | None = None, z: float | None = None, feedrate: Feedrate | None = None):
        cmd = "G1"
        if x is not None:
            cmd += f" X{x:.2f}"
            if feedrate is not None and feedrate.x is not None:
                cmd += f" {feedrate.x}"
        if y is not None:
            cmd += f" Y{y:.2f}"
            if feedrate is not None and feedrate.y is not None:
                cmd += f" {feedrate.y}"
        if z is not None:
            cmd += f" Z{z:.2f}"
            if feedrate is not None and feedrate.z is not None:
                cmd += f" {feedrate.z}"
        
        self.commands.append(cmd)


    def save(self, filename: str):
        with open(filename, "w") as f:
            f.write("\n".join(self.commands))
