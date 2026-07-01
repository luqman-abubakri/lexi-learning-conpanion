import Image from "next/image";

const Navbar = () => {
  return (
    <header>
      <div>
        <Image src="/logo.png" alt="Logo" width={50} height={50} />
      </div>
      <div>
        <ul>
            <li>Home</li>
            <li>Tutors</li>
            <li>My sessions</li>
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
