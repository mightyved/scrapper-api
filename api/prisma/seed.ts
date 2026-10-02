import { JobSourceType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type JobSourceSeed = {
  name: string;
  type: JobSourceType;
  url: string;
  enabled: boolean;
};

const sources: JobSourceSeed[] = [
  {
    name: "We Work Remotely",
    type: JobSourceType.RSS,
    url: "https://weworkremotely.com/remote-jobs.rss",
    enabled: true
  },
  {
    name: "Remote OK",
    type: JobSourceType.API,
    url: "https://remoteok.com/api",
    enabled: true
  },
  {
    name: "Remotive",
    type: JobSourceType.API,
    url: "https://remotive.com/api/remote-jobs",
    enabled: true
  },
  {
    name: "Working Nomads",
    type: JobSourceType.API,
    url: "https://www.workingnomads.com/api/exposed_jobs/",
    enabled: true
  },
  {
    name: "Jobicy APAC Software",
    type: JobSourceType.API,
    url: "https://jobicy.com/api/v2/remote-jobs?count=50&geo=apac&industry=dev",
    enabled: true
  },
  {
    name: "Jobicy LATAM Software",
    type: JobSourceType.API,
    url: "https://jobicy.com/api/v2/remote-jobs?count=50&geo=latam&industry=dev",
    enabled: true
  },
  {
    name: "Jobicy EMEA Software",
    type: JobSourceType.API,
    url: "https://jobicy.com/api/v2/remote-jobs?count=50&geo=emea&industry=dev",
    enabled: true
  },
  {
    name: "Jobicy Worldwide Software",
    type: JobSourceType.API,
    url: "https://jobicy.com/api/v2/remote-jobs?count=50&industry=dev",
    enabled: true
  },
  {
    name: "Himalayas Worldwide Software",
    type: JobSourceType.API,
    url: "https://himalayas.app/jobs/api/search?q=software&worldwide=true&sort=recent",
    enabled: true
  },
  {
    name: "Himalayas RSS",
    type: JobSourceType.RSS,
    url: "https://himalayas.app/jobs/rss",
    enabled: true
  },
  {
    name: "Real Work From Anywhere Software Development",
    type: JobSourceType.RSS,
    url: "https://www.realworkfromanywhere.com/remote-software-developer-jobs/rss.xml",
    enabled: true
  },
  {
    name: "Real Work From Anywhere Backend",
    type: JobSourceType.RSS,
    url: "https://www.realworkfromanywhere.com/remote-backend-jobs/rss.xml",
    enabled: true
  },
  {
    name: "WorkAnywhere Developer",
    type: JobSourceType.RSS,
    url: "https://workanywhere.pro/rss/developer.xml",
    enabled: false
  },
  {
    name: "WorkAnywhere Engineer",
    type: JobSourceType.RSS,
    url: "https://workanywhere.pro/rss/engineer.xml",
    enabled: false
  },
  {
    name: "JobsCollider Remote Jobs",
    type: JobSourceType.RSS,
    url: "https://jobscollider.com/remote-jobs.rss",
    enabled: true
  },
  {
    name: "LaraJobs",
    type: JobSourceType.RSS,
    url: "https://larajobs.com/feed",
    enabled: true
  },
  {
    name: "Rails Jobs",
    type: JobSourceType.RSS,
    url: "https://jobs.rubyonrails.org/jobs.rss",
    enabled: true
  },
  {
    name: "Elixir Jobs",
    type: JobSourceType.RSS,
    url: "https://elixirjobs.net/rss",
    enabled: true
  },
  {
    name: "4 Day Week Jobs",
    type: JobSourceType.RSS,
    url: "https://4dayweek.io/feed",
    enabled: true
  },
  {
    name: "Dribbble Jobs",
    type: JobSourceType.RSS,
    url: "https://dribbble.com/jobs.rss",
    enabled: true
  },
  {
    name: "Berlin Startup Jobs Engineering",
    type: JobSourceType.RSS,
    url: "https://berlinstartupjobs.com/engineering/feed/",
    enabled: true
  },
  {
    name: "GermanTechJobs",
    type: JobSourceType.RSS,
    url: "https://germantechjobs.de/rss",
    enabled: true
  },
  {
    name: "SwissDevJobs",
    type: JobSourceType.RSS,
    url: "https://swissdevjobs.ch/rss",
    enabled: true
  },
  {
    name: "Reed Jobs",
    type: JobSourceType.RSS,
    url: "https://www.reed.co.uk/jobs/rss",
    enabled: true
  },
  {
    name: "Python.org Jobs",
    type: JobSourceType.RSS,
    url: "https://www.python.org/jobs/feed/rss/",
    enabled: true
  },
  {
    name: "VueJobs",
    type: JobSourceType.RSS,
    url: "https://vuejobs.com/feed",
    enabled: true
  },
  {
    name: "Golang Projects",
    type: JobSourceType.RSS,
    url: "https://www.golangprojects.com/rss.xml",
    enabled: true
  },
  {
    name: "RemoteWorkHub",
    type: JobSourceType.RSS,
    url: "https://remoteworkhub.com/feed/",
    enabled: true
  },
  {
    name: "DevITjobs",
    type: JobSourceType.RSS,
    url: "https://devitjobs.com/rss",
    enabled: true
  },
  {
    name: "Arbeitnow Job Board",
    type: JobSourceType.API,
    url: "https://www.arbeitnow.com/api/job-board-api",
    enabled: true
  },
  {
    name: "The Muse Remote Software",
    type: JobSourceType.API,
    url: "https://www.themuse.com/api/public/jobs?category=Software%20Engineering&location=Remote&page=1",
    enabled: true
  },
  {
    name: "Working Nomads APAC",
    type: JobSourceType.API,
    url: "https://www.workingnomads.com/remote-apac-jobs",
    enabled: false
  },
  {
    name: "TokyoDev Fully Remote",
    type: JobSourceType.API,
    url: "https://www.tokyodev.com/jobs/fully-remote",
    enabled: false
  },
  {
    name: "TokyoDev Apply From Abroad",
    type: JobSourceType.API,
    url: "https://www.tokyodev.com/jobs/apply-from-abroad",
    enabled: false
  },
  {
    name: "Japan Dev",
    type: JobSourceType.API,
    url: "https://japan-dev.com/jobs",
    enabled: false
  },
  {
    name: "ITviec",
    type: JobSourceType.API,
    url: "https://itviec.com/it-jobs",
    enabled: false
  },
  {
    name: "VietnamDevs",
    type: JobSourceType.API,
    url: "https://vietnamdevs.com/jobs",
    enabled: false
  },
  {
    name: "LinkedIn APAC Remote Software Engineer",
    type: JobSourceType.API,
    url: "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=software%20engineer&location=Asia-Pacific%20%28APAC%29&f_WT=2&sortBy=DD&f_TPR=r604800",
    enabled: true
  },
  {
    name: "LinkedIn Japan Remote Software Engineer",
    type: JobSourceType.API,
    url: "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=software%20engineer&location=Japan&f_WT=2&sortBy=DD&f_TPR=r604800",
    enabled: true
  },
  {
    name: "LinkedIn Vietnam Remote Software Engineer",
    type: JobSourceType.API,
    url: "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=software%20engineer&location=Vietnam&f_WT=2&sortBy=DD&f_TPR=r604800",
    enabled: true
  },
  {
    name: "LinkedIn LATAM Remote Software Engineer",
    type: JobSourceType.API,
    url: "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=software%20engineer&location=Latin%20America&f_WT=2&sortBy=DD&f_TPR=r604800",
    enabled: true
  },
  {
    name: "LinkedIn EMEA Remote Software Engineer",
    type: JobSourceType.API,
    url: "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=software%20engineer&location=Europe%20Middle%20East%20Africa%20%28EMEA%29&f_WT=2&sortBy=DD&f_TPR=r604800",
    enabled: true
  },
  {
    name: "LinkedIn Worldwide Remote Software Engineer",
    type: JobSourceType.API,
    url: "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=software%20engineer&location=Worldwide&f_WT=2&sortBy=DD&f_TPR=r604800",
    enabled: true
  },
  {
    name: "LinkedIn Worldwide Remote Full Stack Developer",
    type: JobSourceType.API,
    url: "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=full%20stack%20developer&location=Worldwide&f_WT=2&sortBy=DD&f_TPR=r604800",
    enabled: true
  },
  {
    name: "Remote Rocketship Asia Software Engineer",
    type: JobSourceType.API,
    url: "https://www.remoterocketship.com/country/asia/jobs/software-engineer/",
    enabled: false
  },
  {
    name: "NoDesk Remote Jobs",
    type: JobSourceType.API,
    url: "https://nodesk.co/remote-jobs/",
    enabled: false
  },
  {
    name: "Remote.co Software Engineer",
    type: JobSourceType.API,
    url: "https://remote.co/remote-jobs/software-engineer",
    enabled: false
  },
  {
    name: "JustRemote Developer",
    type: JobSourceType.API,
    url: "https://justremote.co/remote-developer-jobs",
    enabled: false
  },
  {
    name: "Dynamite Jobs Developer",
    type: JobSourceType.API,
    url: "https://dynamitejobs.com/remote-jobs/development",
    enabled: false
  },
  {
    name: "RemoteLeaf Anywhere",
    type: JobSourceType.API,
    url: "https://remoteleaf.com/jobs/in-anywhere/",
    enabled: false
  },
  {
    name: "Wellfound Remote Startup Jobs",
    type: JobSourceType.API,
    url: "https://wellfound.com/remote",
    enabled: false
  },
  {
    name: "Arc Remote Developer Jobs",
    type: JobSourceType.API,
    url: "https://arc.dev/remote-jobs?jobRoles=engineering",
    enabled: false
  },
  {
    name: "Y Combinator Remote Software Engineer Jobs",
    type: JobSourceType.API,
    url: "https://www.ycombinator.com/jobs/role/software-engineer/remote",
    enabled: false
  },
  {
    name: "Tech in Asia Jobs",
    type: JobSourceType.API,
    url: "https://www.techinasia.com/jobs",
    enabled: false
  }
];

const catalogOnlySources: JobSourceSeed[] = [
  { name: "Indeed", type: JobSourceType.API, url: "https://www.indeed.com/jobs?q=remote+software", enabled: false },
  { name: "Glassdoor", type: JobSourceType.API, url: "https://www.glassdoor.com/Job/remote-software-jobs-SRCH_KO0,15.htm", enabled: false },
  { name: "ZipRecruiter", type: JobSourceType.API, url: "https://www.ziprecruiter.com/Jobs/Remote-Software", enabled: false },
  { name: "Monster", type: JobSourceType.API, url: "https://www.monster.com/jobs/search?q=remote-software", enabled: false },
  { name: "CareerBuilder", type: JobSourceType.API, url: "https://www.careerbuilder.com/jobs-remote-software", enabled: false },
  { name: "SimplyHired", type: JobSourceType.API, url: "https://www.simplyhired.com/search?q=remote+software", enabled: false },
  { name: "Dice", type: JobSourceType.API, url: "https://www.dice.com/jobs?q=remote%20software", enabled: false },
  { name: "Built In", type: JobSourceType.API, url: "https://builtin.com/jobs/remote/dev-engineering", enabled: false },
  { name: "FlexJobs", type: JobSourceType.API, url: "https://www.flexjobs.com/search?search=software", enabled: false },
  { name: "The Ladders", type: JobSourceType.API, url: "https://www.theladders.com/jobs/remote-software-jobs", enabled: false },
  { name: "Talent.com", type: JobSourceType.API, url: "https://www.talent.com/jobs?k=remote+software", enabled: false },
  { name: "Jooble", type: JobSourceType.API, url: "https://jooble.org/SearchResult?ukw=remote%20software", enabled: false },
  { name: "Adzuna", type: JobSourceType.API, url: "https://www.adzuna.com/search?q=remote+software", enabled: false },
  { name: "CareerJet", type: JobSourceType.API, url: "https://www.careerjet.com/search/jobs?s=remote+software", enabled: false },
  { name: "Jobrapido", type: JobSourceType.API, url: "https://www.jobrapido.com/Remote-Software-jobs", enabled: false },
  { name: "Jobcase", type: JobSourceType.API, url: "https://www.jobcase.com/jobs/search?q=remote%20software", enabled: false },
  { name: "Snagajob", type: JobSourceType.API, url: "https://www.snagajob.com/search?q=remote+software", enabled: false },
  { name: "Hired", type: JobSourceType.API, url: "https://hired.com/jobs", enabled: false },
  { name: "Welcome to the Jungle", type: JobSourceType.API, url: "https://www.welcometothejungle.com/en/jobs?query=remote%20software", enabled: false },
  { name: "Cord", type: JobSourceType.API, url: "https://cord.co/jobs", enabled: false },
  { name: "Wellfound", type: JobSourceType.API, url: "https://wellfound.com/remote", enabled: false },
  { name: "Startup Jobs", type: JobSourceType.API, url: "https://startup.jobs/remote-jobs", enabled: false },
  { name: "Y Combinator Jobs", type: JobSourceType.API, url: "https://www.ycombinator.com/jobs", enabled: false },
  { name: "Hacker News Who is Hiring", type: JobSourceType.API, url: "https://news.ycombinator.com/submitted?id=whoishiring", enabled: false },
  { name: "CrunchBoard", type: JobSourceType.API, url: "https://www.crunchboard.com/jobs/search?keyword=remote%20software", enabled: false },
  { name: "Product Hunt Jobs", type: JobSourceType.API, url: "https://www.producthunt.com/jobs", enabled: false },
  { name: "Remote.co", type: JobSourceType.API, url: "https://remote.co/remote-jobs/developer/", enabled: false },
  { name: "Jobspresso", type: JobSourceType.API, url: "https://jobspresso.co/remote-work/", enabled: false },
  { name: "NoDesk", type: JobSourceType.API, url: "https://nodesk.co/remote-jobs/", enabled: false },
  { name: "JustRemote", type: JobSourceType.API, url: "https://justremote.co/remote-developer-jobs", enabled: false },
  { name: "Dynamite Jobs", type: JobSourceType.API, url: "https://dynamitejobs.com/remote-jobs/development", enabled: false },
  { name: "RemoteLeaf", type: JobSourceType.API, url: "https://remoteleaf.com/jobs/in-anywhere/", enabled: false },
  { name: "Remote Rocketship", type: JobSourceType.API, url: "https://www.remoterocketship.com/country/asia/jobs/software-engineer/", enabled: false },
  { name: "Arc", type: JobSourceType.API, url: "https://arc.dev/remote-jobs?jobRoles=engineering", enabled: false },
  { name: "Turing", type: JobSourceType.API, url: "https://www.turing.com/jobs", enabled: false },
  { name: "Toptal", type: JobSourceType.API, url: "https://www.toptal.com/freelance-jobs", enabled: false },
  { name: "Upwork", type: JobSourceType.API, url: "https://www.upwork.com/freelance-jobs/software-development/", enabled: false },
  { name: "Freelancer", type: JobSourceType.API, url: "https://www.freelancer.com/jobs/software-development/", enabled: false },
  { name: "Fiverr", type: JobSourceType.API, url: "https://www.fiverr.com/categories/programming-tech", enabled: false },
  { name: "Contra", type: JobSourceType.API, url: "https://contra.com/opportunities", enabled: false },
  { name: "Gun.io", type: JobSourceType.API, url: "https://www.gun.io/jobs", enabled: false },
  { name: "Lemon.io", type: JobSourceType.API, url: "https://lemon.io/developers/jobs/", enabled: false },
  { name: "CloudDevs", type: JobSourceType.API, url: "https://clouddevs.com/jobs/", enabled: false },
  { name: "Crossover", type: JobSourceType.API, url: "https://www.crossover.com/jobs", enabled: false },
  { name: "Pangian", type: JobSourceType.API, url: "https://pangian.com/job-travel-remote/", enabled: false },
  { name: "SkipTheDrive", type: JobSourceType.API, url: "https://www.skipthedrive.com/remote-jobs/software-development/", enabled: false },
  { name: "Virtual Vocations", type: JobSourceType.API, url: "https://www.virtualvocations.com/q-telecommuting-software-jobs.html", enabled: false },
  { name: "EuropeRemotely", type: JobSourceType.API, url: "https://europeremotely.com/", enabled: false },
  { name: "EU Remote Jobs", type: JobSourceType.API, url: "https://euremotejobs.com/", enabled: false },
  { name: "Remote Europe", type: JobSourceType.API, url: "https://remote-europe.com/", enabled: false },
  { name: "Remoters", type: JobSourceType.API, url: "https://remoters.net/jobs/", enabled: false },
  { name: "Remote Jobs Asia", type: JobSourceType.API, url: "https://remotejobsasia.com/", enabled: false },
  { name: "Authentic Jobs", type: JobSourceType.API, url: "https://authenticjobs.com/", enabled: false },
  { name: "Ruby on Remote", type: JobSourceType.API, url: "https://rubyonremote.com/", enabled: false },
  { name: "RubyNow", type: JobSourceType.API, url: "https://rubynow.com/", enabled: false },
  { name: "Django Jobs", type: JobSourceType.API, url: "https://djangojobs.net/jobs/", enabled: false },
  { name: "React Jobs", type: JobSourceType.API, url: "https://reactjobs.io/", enabled: false },
  { name: "Rust Jobs", type: JobSourceType.API, url: "https://rustjobs.dev/", enabled: false },
  { name: "Frontend Remote Jobs", type: JobSourceType.API, url: "https://www.frontendremotejobs.com/", enabled: false },
  { name: "Flutter Jobs", type: JobSourceType.API, url: "https://flutterjobs.com/", enabled: false },
  { name: "Android Jobs", type: JobSourceType.API, url: "https://androidjobs.io/", enabled: false },
  { name: "iOS Dev Jobs", type: JobSourceType.API, url: "https://iosdevjobs.com/", enabled: false },
  { name: "InfoSec Jobs", type: JobSourceType.API, url: "https://infosec-jobs.com/", enabled: false },
  { name: "CyberSecJobs", type: JobSourceType.API, url: "https://cybersecjobs.com/", enabled: false },
  { name: "CyberSecurityJobs", type: JobSourceType.API, url: "https://www.cybersecurityjobs.com/", enabled: false },
  { name: "ClearanceJobs", type: JobSourceType.API, url: "https://www.clearancejobs.com/jobs", enabled: false },
  { name: "ClearedJobs.Net", type: JobSourceType.API, url: "https://clearedjobs.net/", enabled: false },
  { name: "AI Jobs", type: JobSourceType.API, url: "https://ai-jobs.net/", enabled: false },
  { name: "aijobs.net", type: JobSourceType.API, url: "https://aijobs.net/", enabled: false },
  { name: "Machine Learning Jobs", type: JobSourceType.API, url: "https://machinelearningjobs.co/", enabled: false },
  { name: "MoAI Jobs", type: JobSourceType.API, url: "https://www.moaijobs.com/", enabled: false },
  { name: "DataJobs", type: JobSourceType.API, url: "https://datajobs.com/", enabled: false },
  { name: "Kaggle Jobs", type: JobSourceType.API, url: "https://www.kaggle.com/jobs", enabled: false },
  { name: "Cryptocurrency Jobs", type: JobSourceType.API, url: "https://cryptocurrencyjobs.co/remote/", enabled: false },
  { name: "CryptoJobsList", type: JobSourceType.API, url: "https://cryptojobslist.com/remote", enabled: false },
  { name: "Web3 Career", type: JobSourceType.API, url: "https://web3.career/remote-jobs", enabled: false },
  { name: "Remote3", type: JobSourceType.API, url: "https://remote3.co/", enabled: false },
  { name: "Dribbble", type: JobSourceType.API, url: "https://dribbble.com/jobs", enabled: false },
  { name: "Behance", type: JobSourceType.API, url: "https://www.behance.net/joblist", enabled: false },
  { name: "Working Not Working", type: JobSourceType.API, url: "https://workingnotworking.com/jobs", enabled: false },
  { name: "Krop", type: JobSourceType.API, url: "https://www.krop.com/creative-jobs/", enabled: false },
  { name: "Design Jobs Board", type: JobSourceType.API, url: "https://www.designjobsboard.com/", enabled: false },
  { name: "AIGA Design Jobs", type: JobSourceType.API, url: "https://designjobs.aiga.org/", enabled: false },
  { name: "Climatebase", type: JobSourceType.API, url: "https://climatebase.org/jobs", enabled: false },
  { name: "Terra.do Climate Jobs", type: JobSourceType.API, url: "https://www.terra.do/climate-jobs/job-board/", enabled: false },
  { name: "Tech Jobs for Good", type: JobSourceType.API, url: "https://techjobsforgood.com/", enabled: false },
  { name: "80,000 Hours", type: JobSourceType.API, url: "https://80000hours.org/job-board/", enabled: false },
  { name: "Idealist", type: JobSourceType.API, url: "https://www.idealist.org/en/jobs", enabled: false },
  { name: "UNjobs", type: JobSourceType.API, url: "https://unjobs.org/", enabled: false },
  { name: "ReliefWeb Jobs", type: JobSourceType.API, url: "https://reliefweb.int/jobs", enabled: false },
  { name: "Devex Jobs", type: JobSourceType.API, url: "https://www.devex.com/jobs", enabled: false },
  { name: "USAJobs", type: JobSourceType.API, url: "https://www.usajobs.gov/Search/Results?k=remote%20software", enabled: false },
  { name: "GovernmentJobs", type: JobSourceType.API, url: "https://www.governmentjobs.com/jobs?keyword=software", enabled: false },
  { name: "Get on Board", type: JobSourceType.API, url: "https://www.getonbrd.com/remote-jobs", enabled: false },
  { name: "Torre", type: JobSourceType.API, url: "https://torre.ai/jobs", enabled: false },
  { name: "Bumeran", type: JobSourceType.API, url: "https://www.bumeran.com.ar/empleos.html", enabled: false },
  { name: "Computrabajo", type: JobSourceType.API, url: "https://www.computrabajo.com/", enabled: false },
  { name: "Remote Work LATAM", type: JobSourceType.API, url: "https://remoteworklatam.com/", enabled: false },
  { name: "OCCMundial", type: JobSourceType.API, url: "https://www.occ.com.mx/empleos/", enabled: false },
  { name: "SEEK", type: JobSourceType.API, url: "https://www.seek.com.au/remote-software-jobs", enabled: false },
  { name: "JobStreet", type: JobSourceType.API, url: "https://www.jobstreet.com/", enabled: false },
  { name: "JobsDB", type: JobSourceType.API, url: "https://hk.jobsdb.com/", enabled: false },
  { name: "VietnamWorks", type: JobSourceType.API, url: "https://www.vietnamworks.com/", enabled: false },
  { name: "TopDev", type: JobSourceType.API, url: "https://topdev.vn/it-jobs", enabled: false },
  { name: "Wantedly", type: JobSourceType.API, url: "https://www.wantedly.com/projects", enabled: false },
  { name: "Greenhouse Job Boards", type: JobSourceType.API, url: "https://www.greenhouse.com/job-boards", enabled: false },
  { name: "Lever Jobs", type: JobSourceType.API, url: "https://www.lever.co/jobs/", enabled: false },
  { name: "Ashby Jobs", type: JobSourceType.API, url: "https://www.ashbyhq.com/", enabled: false },
  { name: "Workable Jobs", type: JobSourceType.API, url: "https://www.workable.com/jobs", enabled: false },
  { name: "SmartRecruiters", type: JobSourceType.API, url: "https://www.smartrecruiters.com/", enabled: false },
  { name: "Workday Jobs", type: JobSourceType.API, url: "https://www.workday.com/", enabled: false },
  { name: "iCIMS", type: JobSourceType.API, url: "https://www.icims.com/", enabled: false },
  { name: "Breezy HR", type: JobSourceType.API, url: "https://breezy.hr/", enabled: false },
  { name: "BambooHR Jobs", type: JobSourceType.API, url: "https://www.bamboohr.com/", enabled: false },
  { name: "Personio Jobs", type: JobSourceType.API, url: "https://www.personio.com/", enabled: false },
  { name: "Recruitee", type: JobSourceType.API, url: "https://recruitee.com/", enabled: false },
  { name: "Teamtailor", type: JobSourceType.API, url: "https://www.teamtailor.com/", enabled: false },
  { name: "Comeet", type: JobSourceType.API, url: "https://www.comeet.com/", enabled: false },
  { name: "Pinpoint", type: JobSourceType.API, url: "https://www.pinpointhq.com/", enabled: false },
  { name: "Rippling Jobs", type: JobSourceType.API, url: "https://www.rippling.com/careers", enabled: false },
  { name: "Deel Jobs", type: JobSourceType.API, url: "https://www.deel.com/careers", enabled: false },
  { name: "Remote.com Jobs", type: JobSourceType.API, url: "https://remote.com/jobs", enabled: false },
  { name: "Reed", type: JobSourceType.API, url: "https://www.reed.co.uk/jobs", enabled: false },
  { name: "CWJobs", type: JobSourceType.API, url: "https://www.cwjobs.co.uk/jobs/remote-software", enabled: false },
  { name: "Totaljobs", type: JobSourceType.API, url: "https://www.totaljobs.com/jobs/remote-software", enabled: false },
  { name: "JobServe", type: JobSourceType.API, url: "https://www.jobserve.com/", enabled: false },
  { name: "StepStone", type: JobSourceType.API, url: "https://www.stepstone.de/jobs/remote-software", enabled: false },
  { name: "XING Jobs", type: JobSourceType.API, url: "https://www.xing.com/jobs", enabled: false },
  { name: "Landing.jobs", type: JobSourceType.API, url: "https://landing.jobs/jobs", enabled: false },
  { name: "DevJobs.at", type: JobSourceType.API, url: "https://devjobs.at/jobs", enabled: false },
  { name: "Remote Impact", type: JobSourceType.API, url: "https://remoteimpact.io/", enabled: false },
  { name: "FreshRemote.work", type: JobSourceType.API, url: "https://freshremote.work/", enabled: false }
];

async function main() {
  const seededUrls = new Set(sources.map((source) => source.url));
  const allSources = [
    ...sources,
    ...catalogOnlySources.filter((source) => !seededUrls.has(source.url))
  ];

  for (const source of allSources) {
    await prisma.jobSource.upsert({
      where: { url: source.url },
      update: {
        enabled: source.enabled,
        name: source.name,
        type: source.type
      },
      create: source
    });
  }

  console.log(`Seeded ${allSources.length} job sources.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
