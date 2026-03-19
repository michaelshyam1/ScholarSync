from sentence_transformers import SentenceTransformer
import torch
from typing import List
from sqlalchemy.orm import Session
from app.models.scholarship import Scholarship
from app.schemas.recommendation import UserProfile


class ScholarshipRecommender:
    def __init__(self):
        # Initialize the sentence transformer model
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

    def prepare_scholarship_features(self, scholarship):
        """Combine relevant scholarship features for similarity calculation"""
        features = [
            scholarship.scholarship_name,
            scholarship.scholarship_description or "",
            scholarship.scholarship_category if isinstance(scholarship.scholarship_category, str) else (
                scholarship.scholarship_category[0] if scholarship.scholarship_category else ""),
            scholarship.scholarship_country or "",
            " ".join(scholarship.tags) if scholarship.tags else ""
        ]
        return " ".join(str(f) for f in filter(None, features))

    def get_recommendations(self, user_profile: UserProfile, db: Session) -> List[Scholarship]:
        """Get personalized scholarship recommendations based on user profile"""

        # Get all scholarships from database
        scholarships = db.query(Scholarship).all()
        if not scholarships:
            return []

        # Filter scholarships based on eligibility criteria
        eligible_scholarships = []
        for s in scholarships:
            min_gpa = getattr(s, "scholarship_min_gpa", None)
            max_age = getattr(s, "scholarship_max_age", None)
            if min_gpa is not None and user_profile.gpa is not None and user_profile.gpa < min_gpa:
                continue
            if max_age is not None and user_profile.age is not None and user_profile.age > max_age:
                continue
            eligible_scholarships.append(s)

        if not eligible_scholarships:
            return []

        # Prepare scholarship texts and create embeddings
        scholarship_texts = [self.prepare_scholarship_features(
            s) for s in eligible_scholarships]
        scholarship_embeddings = self.model.encode(
            scholarship_texts, convert_to_tensor=True)
        # Ensure scholarship_embeddings is a torch.Tensor
        if not isinstance(scholarship_embeddings, torch.Tensor):
            scholarship_embeddings = torch.as_tensor(scholarship_embeddings)

        # Create user profile text and embedding
        user_text = f"{user_profile.interests} {user_profile.field_of_study} {user_profile.country}"
        user_embedding = self.model.encode(user_text, convert_to_tensor=True)
        # Ensure user_embedding is a torch.Tensor and 2D
        if not isinstance(user_embedding, torch.Tensor):
            user_embedding = torch.as_tensor(user_embedding)
        if user_embedding.dim() == 1:
            user_embedding = user_embedding.unsqueeze(0)

        # Expand user_embedding to match the number of scholarships
        user_embedding_expanded = user_embedding.expand(
            scholarship_embeddings.size(0), -1)

        # Calculate cosine similarities
        similarities = torch.nn.functional.cosine_similarity(
            scholarship_embeddings,
            user_embedding_expanded,
            dim=1
        )
        top_k = min(3, len(eligible_scholarships))
        top_indices = torch.topk(similarities, k=top_k).indices.tolist()

        # Return recommended scholarships in order of similarity
        return [eligible_scholarships[idx] for idx in top_indices]


# Create a global instance of the recommender
recommender = ScholarshipRecommender()
