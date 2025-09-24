import {
    TaskAltOutlined,
    StarBorderOutlined,
    FmdGoodOutlined,
    AccessTimeOutlined
} from '@mui/icons-material';
import type { ComponentType } from 'react';

export interface Specialities {
    icon: ComponentType,
    title: string,
    desc: string
}

const speciality: Specialities[] = [
    {
        icon: TaskAltOutlined,
        title: "Verified Experts",
        desc: "Background-checked technicians"
    },
    {
        icon: StarBorderOutlined,
        title: "Quality Service",
        desc: "30-day service guarantee"
    },
    {
        icon: FmdGoodOutlined,
        title: "Local Experts",
        desc: "From your neighborhood"
    },
    {
        icon: AccessTimeOutlined,
        title: "Quick Response",
        desc: "Same-day service available"
    },
]

export default speciality;

