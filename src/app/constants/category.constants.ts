import { CategoryGroupIconType } from '../enums/category-group-icon-type.enum';
import { IconType } from '../enums/icon-type.enum';
import { CategoryIconGroupModel } from '../models/category-icon-group.model';

export const DEFAULT_ICON_COLOR = '#000000'
export const DEFAULT_BACKGROUND_COLOR = '#ffffff'
export const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/

export const ICON_COLOR_PRESETS: string[] = [
  '#000000', '#ffffff', '#e53935', '#d81b60', '#8e24aa', '#3949ab',
  '#1e88e5', '#00897b', '#43a047', '#fdd835', '#fb8c00', '#6d4c41'
]

export const BACKGROUND_COLOR_PRESETS: string[] = [
  '#ffffff', '#eeeeee', '#ffcdd2', '#f8bbd0', '#e1bee7', '#c5cae9',
  '#bbdefb', '#b2dfdb', '#c8e6c9', '#fff9c4', '#ffe0b2', '#d7ccc8'
]

// Shown first for income categories and last for expense categories
export const INCOME_ICON_GROUP = new CategoryIconGroupModel(CategoryGroupIconType.Incomes, [
  IconType.Work, IconType.Payment, IconType.Sell, IconType.Redeem,
  IconType.RealEstateAgent, IconType.EmojiEvents
])

export const CATEGORY_ICON_GROUPS: CategoryIconGroupModel[] = [
  new CategoryIconGroupModel(CategoryGroupIconType.Food, [
    IconType.FastFood, IconType.Cake, IconType.Coffee, IconType.Pizza,
    IconType.Restaurant, IconType.Smoking, IconType.RestaurantMenu, IconType.Bar,
    IconType.SportsBar, IconType.BakeryDining, IconType.RoomService,
    IconType.Grocery, IconType.Delivery
  ]),
  new CategoryIconGroupModel(CategoryGroupIconType.Transport, [
    IconType.Gas, IconType.Train, IconType.Toys, IconType.Airport,
    IconType.Bike, IconType.Bus, IconType.Bus2, IconType.Car, IconType.Taxi,
    IconType.Shipping, IconType.DirectionsBoat
  ]),
  new CategoryIconGroupModel(CategoryGroupIconType.Shopping, [
    IconType.ShoppingCart, IconType.Mall, IconType.CreditCard, IconType.Offer,
    IconType.Store, IconType.Receipt, IconType.Luggage, IconType.Payment,
    IconType.Loyalty, IconType.Key, IconType.Subscriptions
  ]),
  new CategoryIconGroupModel(CategoryGroupIconType.Entertainment, [
    IconType.Movie, IconType.Casino, IconType.Pool, IconType.Golf,
    IconType.Sports, IconType.Tennis, IconType.Surfing, IconType.Baseball,
    IconType.Roller, IconType.Audiotrack, IconType.ColorLens, IconType.HotTub,
    IconType.LiveTv, IconType.SportsSoccer, IconType.TheaterComedy,
    IconType.Celebration, IconType.Ticket, IconType.LocalActivity,
    IconType.Festival, IconType.Groups, IconType.Mic
  ]),
  new CategoryIconGroupModel(CategoryGroupIconType.Maps, [
    IconType.Beach, IconType.Ice, IconType.Mountain, IconType.Place,
    IconType.MyLocation, IconType.Map, IconType.Event, IconType.Parking,
    IconType.Church, IconType.Flag, IconType.Cloud
  ]),
  new CategoryIconGroupModel(CategoryGroupIconType.Medical, [
    IconType.Hospital, IconType.Pharmacy, IconType.Recycling, IconType.Mask,
    IconType.Fitness, IconType.Medication, IconType.HealthAndSafety,
    IconType.Vaccines, IconType.Dentist, IconType.Spa
  ]),
  new CategoryIconGroupModel(CategoryGroupIconType.PersonalCare, [
    IconType.Checkroom, IconType.ContentCut, IconType.Face
  ]),
  new CategoryIconGroupModel(CategoryGroupIconType.Family, [
    IconType.Marry, IconType.Child, IconType.Baby, IconType.Pregnant,
    IconType.Diversity, IconType.People, IconType.Hotel,
    IconType.Florist, IconType.Old, IconType.OldWoman,
    IconType.Man, IconType.Woman, IconType.Transgender, IconType.Pets,
    IconType.Gift, IconType.Donation
  ]),
  new CategoryIconGroupModel(CategoryGroupIconType.Electronic, [
    IconType.Tv, IconType.Print, IconType.Computer, IconType.Kitchen,
    IconType.Camera, IconType.Sync, IconType.Sms,
    IconType.Sd, IconType.Phone, IconType.Bluetooth,
    IconType.Post, IconType.Phone2, IconType.Encryption, IconType.Security,
    IconType.Rotate, IconType.Headphones, IconType.PhoneAndroid, IconType.Keyboard,
    IconType.Cast, IconType.CastConnected, IconType.Memory
  ]),
  new CategoryIconGroupModel(CategoryGroupIconType.Education, [
    IconType.School, IconType.City, IconType.Library,
    IconType.Book, IconType.Poll, IconType.Business, IconType.Inclusive,
    IconType.Pdf, IconType.Attach_file, IconType.Calculate,
    IconType.NewFolder, IconType.Folder
  ]),
  new CategoryIconGroupModel(CategoryGroupIconType.Finance, [
    IconType.Savings, IconType.Wallet, IconType.BalanceWallet,
    IconType.CurrencyExchange, IconType.Monetization, IconType.AttachMoney,
    IconType.TrendingUp, IconType.RequestQuote, IconType.Shield,
    IconType.AccountBalance, IconType.CreditScore, IconType.CurrencyBitcoin, IconType.LocalAtm
  ]),
  new CategoryIconGroupModel(CategoryGroupIconType.Housing, [
    IconType.Home, IconType.Apartment, IconType.Bolt, IconType.WaterDrop,
    IconType.Wifi, IconType.Power, IconType.CleaningServices, IconType.Laundry,
    IconType.Handyman, IconType.Build
  ])
]
