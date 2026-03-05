_PALETTE = [
    "#F87171", "#FB923C", "#FBBF24", "#34D399",
    "#38BDB8", "#60A5FA", "#818CF8", "#E879F9",
    "#F472B6", "#A78BFA",
]


def username_to_color(username: str) -> str:
    """Deterministic color from username — mirrors client-side usernameToColor()."""
    hash_val = 0
    for char in username:
        hash_val = ord(char) + ((hash_val << 5) - hash_val)
    return _PALETTE[abs(hash_val) % len(_PALETTE)]
