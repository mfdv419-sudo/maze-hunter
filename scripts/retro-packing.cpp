// Build-time grid embedding. Runtime reads the audited JSON catalogue only.
#include <algorithm>
#include <array>
#include <cmath>
#include <cstdlib>
#include <iostream>
#include <random>
#include <vector>
using namespace std;
int main(int argc,char**argv){
 if(argc!=8&&argc!=9)return 2;bool incoming=argc==9;int w=atoi(argv[1]),h=atoi(argv[2]),c=atoi(argv[3]),cy=atoi(argv[4]),L=atoi(argv[5]),gy=atoi(argv[6]),seed=atoi(argv[7]);mt19937 rng(seed);auto rnd=[&](){return (rng()+.5)/4294967296.;};
 vector<int> p;for(int y=0;y<h;y++)for(int i=0;i<w;i++)p.push_back(y*w+(y%2?w-1-i:i));if(cy>=0&&((cy+(incoming?2:0)-L)&1))p.erase(p.begin());int n=incoming?L+133:L+(c==2?37:c==3?73:c==4?107:141);if(n>(int)p.size())return 3;p.resize(n);
 vector<pair<int,int>> contacts;if(c==3)contacts={{L,L+37}};if(c>=4)contacts={{L+2,L+37},{L,L+71}};if(c==5)contacts.push_back({L-2,L+107});if(incoming)contacts={{L+2,L+35},{L,L+67},{L-2,L+101}};
 auto md=[&](int a,int b){return abs(a%w-b%w)+abs(a/w-b/w);};auto margin=[&](int v,int low,int high){return max({0,low-v,v-high});};
 auto score=[&](const vector<int>&a){int root=a[L],goal=a[0],s=0;if(cy==-2)s+=margin(root%w,1,w-2)+margin(root/w,2,h-3);else s+=abs(root%w-(incoming?2:0))+(cy>=0?abs(root/w-cy):margin(root/w,2,h-3));if(gy!=-2)s+=abs(goal%w-w+1)+(gy>=0?abs(goal/w-gy):margin(goal/w,2,h-3));if(incoming&&find(a.begin(),a.end(),(cy>=0?cy:root/w)*w)!=a.end())s+=3;if(incoming&&find(a.begin(),a.end(),(cy>=0?cy:root/w)*w+1)!=a.end())s+=3;for(auto [i,j]:contacts)s+=md(a[i],a[j])-1;if(c==2&&cy==-2){int run=1;for(int i=2;i<(int)a.size();i++){run=(a[i]-a[i-1]==a[i-1]-a[i-2])?run+1:1;if(run>5)s++;}}return s;};
 int current=score(p),best=current;vector<int> bp=p,idx(w*h),q;auto index=[&](){fill(idx.begin(),idx.end(),-1);for(int i=0;i<n;i++)idx[p[i]]=i;};index();
 constexpr int dx[]={1,-1,0,0},dy[]={0,0,1,-1};
 for(long long step=0;step<2000000000LL;step++){
  if(!current&&step>=50000){cout<<"[";for(int i=0;i<n;i++){if(i)cout<<",";cout<<"["<<p[i]%w<<","<<p[i]/w<<"]";}cout<<"]\n";cerr<<"packed "<<c<<" at "<<step<<" steps\n";return 0;}
  if(step&&step%150000==0&&rnd()<.6){p=bp;current=best;index();}
  int type=rng()%10,d=rng()%4;
  if(type<4){int i=rng()%(n-3),a=p[i],x=a%w+dx[d],y=a/w+dy[d];if(x<0||y<0||x>=w||y>=h)continue;int j=idx[y*w+x];if(j<=i+1||j>=n-1||md(p[i+1],p[j+1])!=1)continue;q=p;reverse(q.begin()+i+1,q.begin()+j+1);}
  else{bool head=rng()%2;int tip=head?p[0]:p[n-1],x=tip%w+dx[d],y=tip/w+dy[d];if(x<0||y<0||x>=w||y>=h)continue;int v=y*w+x,j=idx[v];q=p;if(j<0){if(head){q.pop_back();q.insert(q.begin(),v);}else{q.erase(q.begin());q.push_back(v);}}
   else if(head){if(j<2)continue;reverse(q.begin(),q.begin()+j);}else{if(j>=n-2)continue;reverse(q.begin()+j+1,q.end());}}
  int value=score(q);double temp=step<50000?1000:.10+1.7*(1.-(step%150000)/150000.);if(value<=current||rnd()<exp((current-value)/temp)){p.swap(q);current=value;index();if(current<best){best=current;bp=p;if(best<4)cerr<<"best "<<best<<" at "<<step<<"\n";}}
 }
 cerr<<"No exact packing found; best score "<<best<<"\n";return 1;
}
