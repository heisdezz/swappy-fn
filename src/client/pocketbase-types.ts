/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export const Collections = {
	Authorigins: "_authOrigins",
	Externalauths: "_externalAuths",
	Mfas: "_mfas",
	Otps: "_otps",
	Superusers: "_superusers",
	Analytics: "analytics",
	Categories: "categories",
	Favorites: "favorites",
	Items: "items",
	Messages: "messages",
	Profile: "profile",
	Promotions: "promotions",
	Reviews: "reviews",
	Store: "store",
	Subscriptions: "subscriptions",
	SwapOffers: "swap_offers",
	Users: "users",
} as const
export type Collections = typeof Collections[keyof typeof Collections]

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export type AnalyticsRecord = {
	copied_count?: number
	id: string
	item: RecordIdString
	views_count?: number
}

export const CategoriesVariantOptions = {
	"base": "base",
	"plus": "plus",
	"pro": "pro",
	"pro_max": "pro_max",
	"mini": "mini",
	"se": "se",
	"air": "air",
	"lite": "lite",
} as const
export type CategoriesVariantOptions = typeof CategoriesVariantOptions[keyof typeof CategoriesVariantOptions]
export type CategoriesRecord = {
	description?: string
	icon?: string
	id: string
	is_active?: boolean
	name: string
	release_year?: number
	series?: string
	slug: string
	sort_order?: number
	variant?: CategoriesVariantOptions
}

export type FavoritesRecord = {
	id: string
	item: RecordIdString
	user: RecordIdString
}

export const ItemsConditionOptions = {
	"brand_new": "brand_new",
	"open_box": "open_box",
	"flawless": "flawless",
	"good": "good",
	"fair": "fair",
	"cracked_screen": "cracked_screen",
	"for_parts": "for_parts",
} as const
export type ItemsConditionOptions = typeof ItemsConditionOptions[keyof typeof ItemsConditionOptions]

export const ItemsCarrierStatusOptions = {
	"factory_unlocked": "factory_unlocked",
	"network_locked": "network_locked",
	"chip_unlocked": "chip_unlocked",
} as const
export type ItemsCarrierStatusOptions = typeof ItemsCarrierStatusOptions[keyof typeof ItemsCarrierStatusOptions]

export const ItemsSimTypeOptions = {
	"physical_sim_plus_esim": "physical_sim_plus_esim",
	"dual_physical_sim": "dual_physical_sim",
	"dual_esim_only": "dual_esim_only",
} as const
export type ItemsSimTypeOptions = typeof ItemsSimTypeOptions[keyof typeof ItemsSimTypeOptions]

export const ItemsStatusOptions = {
	"active": "active",
	"pending_swap": "pending_swap",
	"sold": "sold",
	"swapped": "swapped",
	"draft": "draft",
	"archived": "archived",
} as const
export type ItemsStatusOptions = typeof ItemsStatusOptions[keyof typeof ItemsStatusOptions]

export const ItemsPromotedTierOptions = {
	"none": "none",
	"bump": "bump",
	"top_search": "top_search",
	"homepage_featured": "homepage_featured",
} as const
export type ItemsPromotedTierOptions = typeof ItemsPromotedTierOptions[keyof typeof ItemsPromotedTierOptions]
export type ItemsRecord = {
	accepts_swap?: boolean
	battery_health?: number
	brand?: string
	carrier_status?: ItemsCarrierStatusOptions
	category?: RecordIdString
	color?: string
	condition?: ItemsConditionOptions
	created: IsoAutoDateString
	description?: string
	has_face_id?: boolean
	has_truetone?: boolean
	id: string
	images?: FileNameString[]
	is_promoted?: boolean
	issues?: HTMLString
	location_city?: string
	location_state?: string
	model?: string
	price?: number
	promoted_tier?: ItemsPromotedTierOptions
	promoted_until?: IsoDateString
	seller: RecordIdString
	sim_type?: ItemsSimTypeOptions
	slug?: string
	specifications?: HTMLString
	status?: ItemsStatusOptions
	storage?: string
	store?: RecordIdString
	swap_preferences?: string
	title?: string
	updated: IsoAutoDateString
	views_count?: number
}

export type MessagesRecord = {
	attachments?: FileNameString[]
	chatroom: string
	id: string
	item: RecordIdString
	read?: boolean
	recipient?: RecordIdString
	sender: RecordIdString
	text: string
}

export type ProfileRecord = {
	age: number
	bio?: string
	created: IsoAutoDateString
	email?: string
	emailVisibility?: boolean
	firstName?: string
	id: string
	lastName?: string
	location_city?: string
	location_state?: string
	rating_average?: number
	rating_count?: number
	sex?: string
	total_swaps?: number
	updated: IsoAutoDateString
	user?: RecordIdString
	userName?: string
}

export const PromotionsTierOptions = {
	"bump": "bump",
	"top_search_7d": "top_search_7d",
	"top_search_30d": "top_search_30d",
	"homepage_featured_7d": "homepage_featured_7d",
	"homepage_featured_30d": "homepage_featured_30d",
} as const
export type PromotionsTierOptions = typeof PromotionsTierOptions[keyof typeof PromotionsTierOptions]

export const PromotionsStatusOptions = {
	"pending": "pending",
	"active": "active",
	"expired": "expired",
	"failed": "failed",
} as const
export type PromotionsStatusOptions = typeof PromotionsStatusOptions[keyof typeof PromotionsStatusOptions]
export type PromotionsRecord = {
	amount_paid: number
	expires_at?: IsoDateString
	id: string
	item: RecordIdString
	paystack_reference: string
	start_date?: IsoDateString
	status: PromotionsStatusOptions
	tier: PromotionsTierOptions
	user: RecordIdString
}

export type ReviewsRecord = {
	author: RecordIdString
	comment?: string
	id: string
	item?: RecordIdString
	rating: number
	target_user: RecordIdString
}

export type StoreRecord = {
	address?: string
	banner?: FileNameString
	city?: string
	created: IsoAutoDateString
	description?: string
	id: string
	is_verified?: boolean
	logo?: FileNameString
	name?: string
	owner?: RecordIdString
	phone?: string
	slug: string
	state?: string
	updated: IsoAutoDateString
	whatsapp?: string
}

export const SubscriptionsPlanOptions = {
	"starter": "starter",
	"pro_seller": "pro_seller",
	"dealer_vip": "dealer_vip",
} as const
export type SubscriptionsPlanOptions = typeof SubscriptionsPlanOptions[keyof typeof SubscriptionsPlanOptions]

export const SubscriptionsStatusOptions = {
	"active": "active",
	"expired": "expired",
	"pending_payment": "pending_payment",
} as const
export type SubscriptionsStatusOptions = typeof SubscriptionsStatusOptions[keyof typeof SubscriptionsStatusOptions]
export type SubscriptionsRecord = {
	amount_paid: number
	expires_at: IsoDateString
	id: string
	payment_method?: string
	paystack_reference: string
	plan: SubscriptionsPlanOptions
	start_date?: IsoDateString
	status: SubscriptionsStatusOptions
	user: RecordIdString
}

export const SwapOffersOfferedStorageOptions = {
	"64GB": "64GB",
	"128GB": "128GB",
	"256GB": "256GB",
	"512GB": "512GB",
	"1TB": "1TB",
} as const
export type SwapOffersOfferedStorageOptions = typeof SwapOffersOfferedStorageOptions[keyof typeof SwapOffersOfferedStorageOptions]

export const SwapOffersOfferedConditionOptions = {
	"brand_new": "brand_new",
	"open_box": "open_box",
	"flawless": "flawless",
	"good": "good",
	"fair": "fair",
	"cracked_screen": "cracked_screen",
	"for_parts": "for_parts",
} as const
export type SwapOffersOfferedConditionOptions = typeof SwapOffersOfferedConditionOptions[keyof typeof SwapOffersOfferedConditionOptions]

export const SwapOffersStatusOptions = {
	"pending": "pending",
	"accepted": "accepted",
	"rejected": "rejected",
	"countered": "countered",
	"completed": "completed",
	"cancelled": "cancelled",
} as const
export type SwapOffersStatusOptions = typeof SwapOffersStatusOptions[keyof typeof SwapOffersStatusOptions]
export type SwapOffersRecord = {
	cash_adjustment?: number
	id: string
	message?: string
	offered_battery?: number
	offered_color?: string
	offered_condition?: SwapOffersOfferedConditionOptions
	offered_images?: FileNameString[]
	offered_issues?: string
	offered_model: string
	offered_storage?: SwapOffersOfferedStorageOptions
	proposer: RecordIdString
	seller: RecordIdString
	status?: SwapOffersStatusOptions
	target_item: RecordIdString
}

export const UsersRoleOptions = {
	"user": "user",
	"verified_seller": "verified_seller",
	"admin": "admin",
} as const
export type UsersRoleOptions = typeof UsersRoleOptions[keyof typeof UsersRoleOptions]
export type UsersRecord = {
	avatar?: FileNameString
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	phone?: string
	phone_verified?: boolean
	role?: UsersRoleOptions
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type AnalyticsResponse<Texpand = unknown> = Required<AnalyticsRecord> & BaseSystemFields<Texpand>
export type CategoriesResponse<Texpand = unknown> = Required<CategoriesRecord> & BaseSystemFields<Texpand>
export type FavoritesResponse<Texpand = unknown> = Required<FavoritesRecord> & BaseSystemFields<Texpand>
export type ItemsResponse<Texpand = unknown> = Required<ItemsRecord> & BaseSystemFields<Texpand>
export type MessagesResponse<Texpand = unknown> = Required<MessagesRecord> & BaseSystemFields<Texpand>
export type ProfileResponse<Texpand = unknown> = Required<ProfileRecord> & BaseSystemFields<Texpand>
export type PromotionsResponse<Texpand = unknown> = Required<PromotionsRecord> & BaseSystemFields<Texpand>
export type ReviewsResponse<Texpand = unknown> = Required<ReviewsRecord> & BaseSystemFields<Texpand>
export type StoreResponse<Texpand = unknown> = Required<StoreRecord> & BaseSystemFields<Texpand>
export type SubscriptionsResponse<Texpand = unknown> = Required<SubscriptionsRecord> & BaseSystemFields<Texpand>
export type SwapOffersResponse<Texpand = unknown> = Required<SwapOffersRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	analytics: AnalyticsRecord
	categories: CategoriesRecord
	favorites: FavoritesRecord
	items: ItemsRecord
	messages: MessagesRecord
	profile: ProfileRecord
	promotions: PromotionsRecord
	reviews: ReviewsRecord
	store: StoreRecord
	subscriptions: SubscriptionsRecord
	swap_offers: SwapOffersRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	analytics: AnalyticsResponse
	categories: CategoriesResponse
	favorites: FavoritesResponse
	items: ItemsResponse
	messages: MessagesResponse
	profile: ProfileResponse
	promotions: PromotionsResponse
	reviews: ReviewsResponse
	store: StoreResponse
	subscriptions: SubscriptionsResponse
	swap_offers: SwapOffersResponse
	users: UsersResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
