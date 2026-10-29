# python run_tests.py  -> builds dist.html, runs every test, prints PASS/FAIL per suite
import json, os, re, subprocess, sys
D=os.path.dirname(os.path.abspath(__file__))
run=lambda *a: subprocess.run([sys.executable,*a],cwd=D,capture_output=True,text=True)

def reach_ok(out):
    for l in out.splitlines():
        if '{' in l:
            r=json.loads(l[l.index('{'):])
            if r['unreachable'] or r['noFront'] or r['palletsBlocked'] or r['lanesBlocked'] or r['doorsBlocked']: return False
    return True
def sim_ok(out):
    return all(json.loads(l)['fail']==0 for l in out.splitlines() if l.startswith('{'))

SUITES=[('t2',[],None),('reach',[],reach_ok),('skate',[],None),('sim',['2'],sim_ok),('mtest',[],None)]
b=run('build.py')
if b.returncode: print(b.stdout+b.stderr); print('BUILD FAILED'); sys.exit(1)
bad=[]
for name,args,extra in SUITES:
    p=run(os.path.join('tests',name+'.py'),*args); out=p.stdout+p.stderr
    # page errors print as a python list; a non-empty one starts with ['
    ok=p.returncode==0 and 'FAIL' not in out and not re.search(r"^(errors:? )?\['",out,re.M)
    if ok and extra: ok=extra(out)
    print(('PASS ' if ok else 'FAIL ')+name)
    if not ok or '-v' in sys.argv: print(out)
    if not ok: bad.append(name)
print('ALL GREEN' if not bad else 'RED: '+', '.join(bad))
print('skate numbers are not checked against targets; run "python tests/skate.py" to see them.')
sys.exit(1 if bad else 0)
