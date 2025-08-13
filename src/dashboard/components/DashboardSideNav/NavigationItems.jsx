import {
	LuArrowLeftRight,
	LuGift,
	LuPickaxe,
	LuPiggyBank,
	LuRefreshCw,
	LuShield,
	LuWallet,
} from "react-icons/lu";
import { PiPiggyBank } from "react-icons/pi";

const navigationItems = [
	{
		name: "Buy",
		path: "/dashboard/buy",
		icon: LuWallet,
		description: "Purchase cryptocurrency",
	},
	{
		name: "Swap",
		path: "/dashboard/swap-tokens",
		icon: LuArrowLeftRight,
		description: "Exchange tokens",
	},
	{
		name: "convert",
		path: "/dashboard/convert-tokens",
		icon: LuRefreshCw,
		description: "Convert between currencies",
	},
	{
		name: "staking",
		path: "/dashboard/staking",
		icon: PiPiggyBank,
		description: "Earn rewards by staking",
	},
	{
		name: "Mine",
		path: "/dashboard/start-mining",
		icon: LuPickaxe,
		description: "Mine cryptocurrency",
	},
	{
		name: "rewards",
		path: "/dashboard/rewards",
		icon: LuGift,
		description: "View your rewards",
	},
	{
		name: "admin",
		path: "/dashboard/admin",
		icon: LuShield,
		description: "Admin panel",
	},
];

export default navigationItems;
