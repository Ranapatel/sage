$p = 'frontend\components\layout\Navbar.tsx'
$c = Get-Content $p -Raw
$search = '<Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-[52px] px-4 text-lg font-semibold text-slate-900 hover:bg-slate-50 rounded-xl">Blog</Link>'
$replace = $search + "`r`n                 <Link href=`"/activities`" onClick={() => setMobileMenuOpen(false)} className=`"flex items-center h-[52px] px-4 text-lg font-semibold text-slate-900 hover:bg-slate-50 rounded-xl`">Activities</Link>"
$c = $c.Replace($search, $replace)
Set-Content $p $c
