import { NavBar } from "./Components/NavBar";
import { Footer } from "./Components/Footer";

export default function Layout({ children }) {
    return (
        <>
            <NavBar />
            {children}
            <Footer />
        </>
    );
}
