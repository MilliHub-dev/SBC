// Dashboard Layout and routing
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import StartMining from "../dashboard/pages/start-mining/StartMining";
import BuyTokens from "../dashboard/pages/buy/BuyTokens";
import ConvertTokens from "../dashboard/pages/convert/ConvertTokens";
import Rewards from "../dashboard/pages/rewards/Rewards";
import Staking from "../dashboard/pages/staking/Staking";
import Swap from "../dashboard/pages/swap/Swap";
import AdminPanel from "../dashboard/pages/admin/AdminPanel";

export const dashboardRoutes = [
	{
		path: "/dashboard",
		element: <DashboardLayout />,
		children: [
			{
				index: true,
				element: <StartMining />,
			},
			{
				path: "start-mining",
				element: <StartMining />,
			},
			{
				path: "buy",
				element: <BuyTokens />,
			},
			{
				path: "convert-tokens",
				element: <ConvertTokens />,
			},
			{
				path: "rewards",
				element: <Rewards />,
			},
			{
				path: "staking",
				element: <Staking />,
			},
			{
				path: "swap-tokens",
				element: <Swap />,
			},
			{
				path: "admin",
				element: <AdminPanel />,
			},
		],
	},
];
