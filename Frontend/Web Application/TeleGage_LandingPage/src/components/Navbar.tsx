import Image from 'next/image';
import logoImg from '../assets/images/logosaas.png';
import MenuIcon from '../assets/icons/menu.svg';
import Link from 'next/link';

export const Navbar = () => {
  return (
    <div className='bg-black text-white'>
      <div className="container">
        <div className='py-4 flex items-center justify-between'>
          <div className='relative'>
            <div className='absolute w-full top-0 bottom-0 bg-[linear-gradient(to_right,#F87BFF,#FB92CF,#FFDD9B,#C2F0B1,#2FD8FE)] blur-md'></div>
            <Image src={logoImg} alt="saas logo" className='w-12 h-12 relative' />
          </div>
          <div className='border border-white border-opacity-25 h-10 w-10 rounded-lg inline-flex items-center justify-center sm:hidden'>
            <MenuIcon />
          </div>
          <nav className='items-center gap-6 hidden sm:flex'>
            <Link href='/' className='text-white text-opacity-60 hover:text-opacity-100 transition'>Features</Link>
            <Link href='/' className='text-white text-opacity-60 hover:text-opacity-100 transition'>How It Works</Link>
            <Link href='/' className='text-white text-opacity-60 hover:text-opacity-100 transition'>Pricing</Link>
            <Link href='/' className='text-white text-opacity-60 hover:text-opacity-100 transition'>Case Studies</Link>
            <Link href='/auth' className='text-white text-opacity-60 hover:text-opacity-100 transition'>Login / Sign Up</Link>
            <Link href='/auth'>
              <button className='bg-white text-black py-2 px-4 rounded-lg hover:scale-[1.03] transition'>
                Get TeleGage
              </button>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};
