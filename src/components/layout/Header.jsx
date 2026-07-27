import Logo from '../ui/Logo';
import Navbar from './Navbar';

function Header() {
  return (
    <header className="header">
      <Logo />
      <Navbar />
    </header>
  );
}

export default Header;