import { Calculator, ChevronRight, FileSearch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserAppShell } from '../components/user/UserAppShell';

export default function UserUtilities() {
  return <UserAppShell><div className="mx-auto max-w-[850px] px-5 py-6">
    <h1 className="text-[26px] font-bold">Utilidades</h1>
    <p className="mt-2 mb-6 text-[15px] leading-6 text-[#5b6b82]">Herramientas para entender tus documentos y saber qué puedes reclamar.</p>
    <div className="space-y-4">{[
      { href: '/client/utilities/contracts', title: 'Analizador de contratos', text: 'Sube un contrato y te explicamos las cláusulas importantes y posibles riesgos.', Icon: FileSearch },
      { href: '/client/utilities/calculator', title: 'Calculadora de indemnizaciones', text: 'Calcula una estimación de la indemnización que podría corresponderte.', Icon: Calculator },
    ].map(({ href, title, text, Icon }) => <Link key={href} to={href} className="block rounded-2xl border border-[#e6eaf0] bg-white p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3ead3]"><Icon size={23} /></div>
      <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">{title}</h2><ChevronRight size={20} className="shrink-0 text-[#9a7a24]" /></div>
      <p className="mt-2 text-[14px] leading-5 text-[#5b6b82]">{text}</p>
    </Link>)}</div>
  </div></UserAppShell>;
}
