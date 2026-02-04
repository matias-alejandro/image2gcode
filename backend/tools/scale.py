class Scale:
    def __init__(self, x: float, y: float, z: float) -> None:
        self.x = x
        self.y = y
        self.z = z

    def __mul__(self, other):
        return Scale(self.x * other.x, self.y * other.y, self.z * other.z)

    def __rmul__(self, other):
        return Scale(other * self.x, other * self.y, other * self.z)