import ACIcon from '../../assets/icons/AC.svg'
import FanIcon from '../../assets/icons/Fan.svg'
import WashingMachineIcon from '../../assets/icons/WashingMachine.svg'
import RefrigeratorIcon from '../../assets/icons/Refrigerator.svg'
import TVIcon from '../../assets/icons/TV.svg'
import MicrowaveIcon from '../../assets/icons/Microwave.svg'

const services: {
    icon: string,
    title: string,
    description: string,
    button: string,
    popular?: boolean
}[] = [
    {
        icon: ACIcon,
        title: "AC Repair & Service", 
        description: "Professional repair and maintenance for all AC brands", button: "Book Now ",
        popular: true
    },
    {
        icon: WashingMachineIcon,
        title: "Wahing Machine", 
        description: "Fix leaks, motor issues, and other washing machine problems", 
        button: "Book Now ",
        popular: true
    },
    {
        icon: RefrigeratorIcon,
        title: "Refrigerator", 
        description: "Cooling issues, gas refilling, and general maintenance", button: "Book Now "
    },
    {
        icon: FanIcon,
        title: "Fan Repair", 
        description: "Ceiling, table, and exhaust fan repairs and installation", button: "Book Now "
    },
    {
        icon: TVIcon,
        title: "TV Repair", 
        description: "LCD, LED, and Smart TV repairs and installations", button: "Book Now "
    },
    {
        icon: MicrowaveIcon,
        title: "Microwave", 
        description: "Heating problems, door issues, and other microwave repairs", 
        button: "Book Now "
    },
]

export default services