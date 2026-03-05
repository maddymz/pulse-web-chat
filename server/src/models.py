from pydantic import BaseModel


class User(BaseModel):
    id: str
    username: str
    avatar_color: str = ""

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "username": self.username,
            "avatarColor": self.avatar_color,
        }


class Message(BaseModel):
    id: str
    room_id: str
    sender_id: str
    sender_name: str
    avatar_color: str
    text: str
    timestamp: int  # Unix ms

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "roomId": self.room_id,
            "senderId": self.sender_id,
            "senderName": self.sender_name,
            "avatarColor": self.avatar_color,
            "text": self.text,
            "timestamp": self.timestamp,
        }


class Room(BaseModel):
    id: str
    name: str
    created_by: str
    member_ids: list[str] = []

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "createdBy": self.created_by,
            "memberIds": list(self.member_ids),
        }
