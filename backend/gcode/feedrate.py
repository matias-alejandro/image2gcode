class Feedrate:
    def __init__(self, value: int) -> None:
        self.value = value

    def __str__(self) -> str:
        return f"F{self.value}"