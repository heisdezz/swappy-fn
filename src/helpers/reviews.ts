import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "../client/pb";
import { extract_message } from "./api";

export interface ReviewRecord {
  id: string;
  author: string;
  target_user: string;
  item?: string;
  rating: number;
  comment: string;
  created: string;
  updated: string;
  expand?: {
    author?: {
      id: string;
      name?: string;
      username?: string;
      avatar?: string;
      verified?: boolean;
    };
    item?: {
      id: string;
      title?: string;
      model?: string;
      storage?: string;
      price?: number;
    };
  };
}

export interface ReviewSummary {
  average: number;
  total: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export function computeReviewSummary(reviews: ReviewRecord[]): ReviewSummary {
  if (!reviews || reviews.length === 0) {
    return {
      average: 5.0,
      total: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  for (const r of reviews) {
    const stars = Math.min(5, Math.max(1, Math.round(r.rating || 5))) as
      | 1
      | 2
      | 3
      | 4
      | 5;
    breakdown[stars] = (breakdown[stars] || 0) + 1;
    sum += r.rating || 5;
  }

  const average = Number((sum / reviews.length).toFixed(1));

  return {
    average,
    total: reviews.length,
    breakdown,
  };
}

export function useSellerReviews(sellerId?: string) {
  const query = useQuery({
    queryKey: ["reviews", "seller", sellerId],
    enabled: !!sellerId,
    queryFn: async () => {
      if (!sellerId) return [];
      try {
        const res = await pb.collection("reviews").getList<ReviewRecord>(1, 50, {
          filter: `target_user = "${sellerId}"`,
          expand: "author,item",
          sort: "-created",
          requestKey: null,
        });
        return res.items;
      } catch (err) {
        console.warn("Could not fetch seller reviews:", err);
        return [];
      }
    },
  });

  const summary = computeReviewSummary(query.data || []);

  return {
    reviews: query.data || [],
    summary,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      target_user: string;
      item?: string;
      rating: number;
      comment: string;
    }) => {
      const currentUserId = pb.authStore.record?.id;
      if (!currentUserId) {
        throw new Error("You must be logged in to submit a review.");
      }

      if (currentUserId === payload.target_user) {
        throw new Error("You cannot write a review for your own account.");
      }

      const record = await pb.collection("reviews").create<ReviewRecord>(
        {
          author: currentUserId,
          target_user: payload.target_user,
          item: payload.item || undefined,
          rating: payload.rating,
          comment: payload.comment,
        },
        { expand: "author,item" }
      );

      return record;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", "seller", variables.target_user],
      });
      queryClient.invalidateQueries({
        queryKey: ["store"],
      });
      queryClient.invalidateQueries({
        queryKey: ["item"],
      });
    },
    onError: (err) => {
      console.error("Submit review error:", extract_message(err));
    },
  });
}
