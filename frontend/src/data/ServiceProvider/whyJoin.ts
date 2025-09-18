import {
    AccountBalanceWalletOutlined,
    CalendarTodayOutlined,
    StarBorderOutlined,
    VerifiedUserOutlined,
    TrendingUpOutlined
} from '@mui/icons-material';
import type { ComponentType } from 'react';

const whyJoin: {
    icon: ComponentType,
    title: string,
    description: string,
}[] = [
    {
        icon: AccountBalanceWalletOutlined,
        title: "Earn More", 
        description: "Earn up to ₹30,000 per month with regular service requests", 
    },
    {
        icon: CalendarTodayOutlined,
        title: "Flexible Hours", 
        description: "Choose your working hours and manage your availability", 
    },
    {
        icon: StarBorderOutlined,
        title: "Build Reputationr", 
        description: "Gain ratings and reviews to stand out from competition"
    },
    {
        icon: VerifiedUserOutlined,
        title: "Varified Status", 
        description: "Get verified badge after background check for more trust"
    },
    {
        icon: TrendingUpOutlined,
        title: "Growth Opportunity ", 
        description: "Expand your skills and customer base with our platform"
    },
]

export default whyJoin