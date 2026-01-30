class Feedrate:
    def __init__(self, x: int, y: int, z: int) -> None:
        self.x_val = x
        self.y_val = y
        self.z_val = z

    def __format(self, value: int) -> str:
        return f"F{value}"

    @property
    def x(self) -> str:
        return self.__format(self.x_val)

    @property
    def y(self) -> str:
        return self.__format(self.y_val)

    @property
    def z(self) -> str:
        return self.__format(self.z_val)