import type { Metadata } from 'next';
import './globals.css';
import './cinematic.css';
import './archive.css';
export const metadata: Metadata = {title:'GPU Legends · A escolha é sua',description:'Placas antigas e atuais que marcaram gerações. Compare, escolha sua favorita e vote, mesmo offline.',icons:{icon:'/favicon.svg',apple:'/icons/icon-192.png'},manifest:'/manifest.webmanifest'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="pt-BR" className="dark"><head><meta name="theme-color" content="#060608"/><link rel="preload" as="image" href="/images/gpu-illustration.webp"/><noscript><style>{`.opening-screen{display:none!important}`}</style></noscript></head><body>{children}</body></html>;}
