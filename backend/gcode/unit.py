from enum import Enum

class Unit(Enum):
    MM = "G21"
    IN = "G20"

    def __str__(self):
        return self.value
