$p = 'frontend\components\layout\Footer.tsx'
$c = Get-Content $p -Raw
$search = '<Link href="/plan" className="hover:text-blue-400 transition-colors">AI Planner</Link>'
$replace = $search + "`r`n                <Link href=`"/activities`" className=`"hover:text-blue-400 transition-colors`">Activities</Link>"
$c = $c.Replace($search, $replace)
Set-Content $p $c
