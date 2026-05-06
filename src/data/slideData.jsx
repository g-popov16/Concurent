import RaceDemo from '../slides/RaceDemo.jsx'
import InheritanceTree from '../slides/InheritanceTree.jsx'
import CompareTable from '../slides/CompareTable.jsx'
import FlowChart from '../slides/FlowChart.jsx'
import Game1 from '../games/Game1WaitAny.jsx'
import Game2 from '../games/Game2Mutex.jsx'
import Game3 from '../games/Game3Turnstile.jsx'
import Game4 from '../games/Game4TrafficLight.jsx'
import Game5 from '../games/Game5CodeMutex.jsx'
import Game6 from '../games/Game6CodeAutoReset.jsx'
import Quiz from '../quiz/Quiz.jsx'

export const parts = [
  { id: 'I',   title: 'Основи',               color: '#7c6af5', range: [0, 5]   },
  { id: 'II',  title: 'WaitHandle',            color: '#5ba4f5', range: [6, 8]   },
  { id: 'III', title: 'Mutex',                 color: '#e8622a', range: [9, 15]  },
  { id: 'IV',  title: 'EventWaitHandle',       color: '#c9922a', range: [16, 23] },
  { id: 'V',   title: 'Сравнение',             color: '#3ec88a', range: [24, 28] },
  { id: 'VI',  title: 'Заключение',            color: '#8a8795', range: [29, 30] },
]

export const slides = [
  // ─── Part I ────────────────────────────────────────────────────────────────

  {
    id: 1, type: 'title', part: 'I',
    title: 'Неуправляваща синхронизация в C#',
    subtitle: 'WaitHandle и неговите наследници',
    authors: ['Георги Попов', 'Ивайло Киров'],
    klass: '11д клас, ПМГ „Константин Величков"',
    speakerNotes: 'Добре дошли. Днешната тема е kernel-level синхронизация в C# — класовете Mutex, AutoResetEvent и ManualResetEvent. Ще разгледаме теория, ще пишем код и ще играем четири игри.',
  },

  {
    id: 2, type: 'theory', part: 'I',
    title: 'Какво е синхронизация?',
    sections: [
      {
        type: 'text',
        text: 'Thread-овете в един процес споделят обща памет. Когато два thread-а четат и пишат в един адрес без координация, редът на операциите зависи от scheduler-а — не от кода.'
      },
      {
        type: 'callout',
        label: 'Пример',
        text: 'T1 чете counter = 0, T2 чете counter = 0. T1 записва 1. T2 записва 1. Резултат: 1 вместо 2.',
      },
      {
        type: 'text',
        text: 'Аналогия от живота: двама колеги редактират един Excel файл без споделен достъп. Ако запишат по едно и също време, едното запазване заличава другото.'
      },
      {
        type: 'text',
        text: 'Синхронизацията дава на thread-овете начин да се разберат кой работи кога. Без нея резултатът от паралелен код е недетерминиран.'
      },
    ],
    speakerNotes: 'Нека кажем на учениците да се сетят за последния път, когато двама са редактирали едновременно. Race condition е точно това — само на ниво регистри. Ще го покажем интерактивно на следващия слайд.',
  },

  {
    id: 3, type: 'interactive', part: 'I',
    title: 'Демо: Race Condition',
    component: RaceDemo,
    speakerNotes: 'Натиснете "Старт без синхронизация". Двата thread-а инкрементират едновременно — резултатът ще е по-малък от 2000. После пробвайте с lock. Разликата е очевидна.',
  },

  {
    id: 4, type: 'theory', part: 'I',
    title: 'Управлявана vs Неуправлявана синхронизация',
    sections: [
      {
        type: 'text',
        text: 'C# предлага два нива на синхронизация. Изборът зависи от това дали трябва да координираме thread-ове само в процеса или между различни процеси.'
      },
      {
        type: 'compare-table',
        left: {
          label: 'lock / Monitor',
          accent: '',
          rows: [
            ['Ниво', 'CLR (user space)'],
            ['Достъп', 'само в процеса'],
            ['Производителност', '~10–20 ns'],
            ['Thread affinity', 'не'],
            ['Сигнализиране', 'Monitor.Wait / Pulse'],
          ]
        },
        right: {
          label: 'WaitHandle йерархия',
          accent: 'accent',
          rows: [
            ['Ниво', 'Kernel (OS)'],
            ['Достъп', 'cross-process с имена'],
            ['Производителност', '~200–500 ns'],
            ['Thread affinity', 'Mutex: да'],
            ['Сигнализиране', 'Set() / Reset()'],
          ]
        }
      },
      {
        type: 'text',
        text: 'lock е по-бърз за in-process ситуации. WaitHandle е необходим когато двa различни процеса трябва да координират достъпа до споделен ресурс.'
      },
    ],
    speakerNotes: 'Повечето код в реални приложения използва lock. WaitHandle се появява главно в системен код, Windows Services и ситуации с именувани ресурси между процеси.',
  },

  {
    id: 5, type: 'theory', part: 'I',
    title: 'Какво е kernel object?',
    sections: [
      {
        type: 'text',
        text: 'Операционната система пази таблица с kernel objects — структури в kernel space паметта. Всяко приложение получава handle: число, което сочи към тази структура.'
      },
      {
        type: 'list',
        items: [
          'Mutex, Event, Semaphore, File, Thread — всички са kernel objects',
          'WaitHandle в C# е обвивка около такъв handle (SafeWaitHandle)',
          'Два процеса с различни адресни пространства могат да споделят един kernel object по неговото ИМЕ',
        ]
      },
      {
        type: 'callout',
        label: 'Защо е по-бавно?',
        text: 'Всяко WaitOne() и Set() изисква syscall. Процесорът превключва от user mode в kernel mode и обратно. Именно това е цената на cross-process видимостта.',
      },
    ],
    speakerNotes: 'Kernel mode switch е около 100–200 cycles overhead. За сравнение, lock използва само CAS операция в user space — без syscall. Ако нямате нужда от cross-process, lock е правилният избор.',
  },

  {
    id: 6, type: 'interactive', part: 'I',
    title: 'Йерархия на класовете',
    component: InheritanceTree,
    speakerNotes: 'Тази диаграма ще се появява пак в края. WaitHandle е абстрактен базов клас. Mutex и EventWaitHandle са преки наследници. AutoResetEvent и ManualResetEvent наследяват EventWaitHandle.',
  },

  // ─── Part II ───────────────────────────────────────────────────────────────

  {
    id: 7, type: 'theory', part: 'II',
    title: 'Class WaitHandle',
    sections: [
      {
        type: 'text',
        text: 'System.Threading.WaitHandle е абстрактен клас — не може да се инстанцира директно. Обвива OS kernel handle и предоставя методите за изчакване.'
      },
      {
        type: 'code',
        lang: 'csharp',
        code: `// Ключови членове на WaitHandle
public abstract class WaitHandle : IDisposable
{
    // Обвива OS handle
    public SafeWaitHandle SafeWaitHandle { get; set; }

    // Изчаква THIS handle (instance метод)
    public virtual bool WaitOne();
    public virtual bool WaitOne(int millisecondsTimeout);
    public virtual bool WaitOne(TimeSpan timeout);

    // Изчакват МАСИВ от handles (статични)
    public static bool    WaitAll(WaitHandle[] waitHandles);
    public static int     WaitAny(WaitHandle[] waitHandles);

    public virtual void Close();     // освобождава kernel handle
    public void Dispose();
}`,
      },
      {
        type: 'text',
        text: 'WaitOne() връща true ако handle-ът е сигнализиран, false ако е изтекъл timeout-ът. WaitAny() връща индекса на handle-а, довел до събуждането.'
      },
    ],
    speakerNotes: 'Важно: Close() или Dispose() трябва да се вика когато приключим с handle-а — иначе OS ресурсът остава зает. В последните версии на .NET, using pattern е препоръчан.',
  },

  {
    id: 8, type: 'theory', part: 'II',
    title: 'Ключови методи',
    sections: [
      {
        type: 'method-list',
        items: [
          {
            name: 'WaitOne([timeout])',
            desc: 'Блокира извикващия thread докато THIS handle не стане сигнализиран или изтече timeout. Без timeout — чака безкрайно.',
            note: 'Внимавай: WaitOne() без timeout може да блокира thread-а завинаги при bug.'
          },
          {
            name: 'WaitAll(WaitHandle[])',
            desc: 'Блокира докато ВСИЧКИ handles в масива не станат сигнализирани. Подходящ за "изчакай всички задачи".',
            note: 'Не работи с повтарящи се handles в масива.'
          },
          {
            name: 'WaitAny(WaitHandle[])',
            desc: 'Блокира докато ПОНЕ ЕДИН handle не стане сигнализиран. Връща индекса му в масива.',
            note: 'Ако няколко са сигнализирани едновременно, индексът е недетерминиран.'
          },
          {
            name: 'Set()',
            desc: 'Сигнализира handle-а (само при EventWaitHandle и наследниците му).',
            note: ''
          },
          {
            name: 'Reset()',
            desc: 'Маха сигнала от handle-а (само при ManualResetEvent).',
            note: ''
          },
        ]
      },
    ],
    speakerNotes: 'Методите Set() и Reset() не са дефинирани в WaitHandle — те са в EventWaitHandle. Mutex няма Set() — освобождава се с ReleaseMutex().',
  },

  {
    id: 9, type: 'game', part: 'II',
    title: 'Игра 1 — WaitAny vs WaitAll',
    component: Game1,
    speakerNotes: 'Нека учениците опитат двата режима. WaitAny се събужда при първата лампа — WaitAll чака всички четири. Ключова разлика за producer-consumer сценарии.',
  },

  // ─── Part III ──────────────────────────────────────────────────────────────

  {
    id: 10, type: 'theory', part: 'III',
    title: 'Mutex — въведение',
    sections: [
      {
        type: 'text',
        text: 'Mutex (Mutual Exclusion) гарантира, че само един thread може да влезе в критична секция в даден момент. За разлика от lock, Mutex е kernel object и може да се използва между процеси.'
      },
      {
        type: 'highlight-box',
        accent: 'mutex',
        title: 'Thread affinity',
        text: 'Само thread-ът, взел mutex-а с WaitOne(), може да го освободи с ReleaseMutex(). Ако друг thread се опита — ApplicationException. Това е различно от lock, където всеки thread в блока може да излезе.',
      },
      {
        type: 'list',
        items: [
          'new Mutex(false) — ненаследен mutex, не се взима при създаване',
          'new Mutex(true)  — взима mutex-а веднага при конструиране',
          'new Mutex(false, "Global\\\\MyApp") — именуван, видим от целия OS',
        ]
      },
    ],
    speakerNotes: 'Thread affinity е едно от нещата, с които учениците ще се объркват. Подчертайте: трябва да се освободи от СЪЩИЯ thread, който го е взел. Затова try/finally е задължителен.',
  },

  {
    id: 11, type: 'theory', part: 'III',
    title: 'Кога се използва Mutex?',
    sections: [
      {
        type: 'text',
        text: 'Mutex е по-скъп от lock — използвай го само когато наистина е необходим.'
      },
      {
        type: 'scenario-list',
        items: [
          {
            icon: '🔄',
            title: 'Cross-process достъп',
            text: 'Два процеса пишат в един файл. Именуван Mutex с "Global\\\\" prefix се вижда от двата.',
          },
          {
            icon: '🔒',
            title: 'Single-instance приложение',
            text: 'При стартиране проверяваш дали Mutex с твоето ИМЕ вече съществува. Ако да — друг екземпляр вече работи.',
          },
          {
            icon: '👤',
            title: 'Thread ownership',
            text: 'Когато е важно да знаеш кой точно thread държи ресурса и само той да може да го освободи.',
          },
        ]
      },
      {
        type: 'callout',
        label: 'Правило',
        text: 'В рамките на един процес — използвай lock или Monitor. Mutex е за cross-process сценарии.',
      },
    ],
    speakerNotes: 'Single-instance pattern е класически пример, който учениците ще срещнат в Windows desktop разработка. Покажете им именуването Global\\ vs. local.',
  },

  {
    id: 12, type: 'theory', part: 'III',
    title: 'Mutex — основна употреба',
    sections: [
      {
        type: 'text',
        text: 'Стандартният pattern е: WaitOne() → критична секция → ReleaseMutex() в finally блок.'
      },
      {
        type: 'code',
        lang: 'csharp',
        code: `var mtx = new Mutex(false, "Global\\\\SharedResource");

bool acquired = mtx.WaitOne(TimeSpan.FromSeconds(5));
if (!acquired)
{
    Console.WriteLine("Timeout — друг процес държи mutex-а.");
    return;
}

try
{
    // Само един thread/процес влиза тук
    WriteToSharedFile();
}
finally
{
    // Задължително — дори при exception
    // Само owner thread-ът може да вика това
    mtx.ReleaseMutex();
}`,
      },
      {
        type: 'callout',
        label: 'Защо finally?',
        text: 'Ако WriteToSharedFile() хвърли изключение и не освободим mutex-а, всички останали thread-ове ще блокират завинаги. finally гарантира освобождаване при всякакъв изход.',
      },
    ],
    speakerNotes: 'Паузирайте при finally блока. Попитайте какво би се случило ако го няма. Очаквания отговор: deadlock при следващо WaitOne().',
  },

  {
    id: 13, type: 'game', part: 'III',
    title: 'Игра 2 — Ключът от тоалетната',
    component: Game2,
    speakerNotes: 'Само един thread може да държи ключа. Грешното освобождаване от друг thread трябва да покаже ApplicationException. Накарайте учениците да опитат да освободят от грешния thread.',
  },

  {
    id: 14, type: 'theory', part: 'III',
    title: 'Named Mutex',
    sections: [
      {
        type: 'text',
        text: 'Именуваните mutex-и са видими в целия OS. Два процеса с едно и също НАЗВАНИЕ получават handle към един и същи kernel object.'
      },
      {
        type: 'code',
        lang: 'csharp',
        code: `// Single-instance pattern
bool createdNew;
using var mtx = new Mutex(
    initiallyOwned: true,
    name: "Global\\\\MyDesktopApp",
    out createdNew
);

if (!createdNew)
{
    MessageBox.Show("Приложението вече работи.");
    Application.Exit();
    return;
}

// Само един екземпляр стига дотук
Application.Run(new MainForm());`,
      },
      {
        type: 'list',
        items: [
          '"Global\\\\" — видим от всички sessions (RemoteDesktop, FastUser)',
          '"Local\\\\" или без prefix — само в текущата user session',
          'initiallyOwned: true — взима mutex-а при конструиране; ако вече съществува, createdNew = false',
        ]
      },
    ],
    speakerNotes: 'Global\\ е важно за server приложения и Windows Services. Без него, ако потребителят влезе от Remote Desktop, ще може да стартира второ копие.',
  },

  {
    id: 15, type: 'theory', part: 'III',
    title: 'Капани при Mutex',
    sections: [
      {
        type: 'pitfall-list',
        items: [
          {
            title: 'Abandoned mutex',
            text: 'Thread-ът умира (crash/exception) без да е извикал ReleaseMutex(). OS маркира mutex-а като "abandoned". Следващото WaitOne() ще хвърли AbandonedMutexException.',
            code: `// Следващият thread ще получи:
try { mtx.WaitOne(); }
catch (AbandonedMutexException)
{
    // Mutex-ът е взет, но данните може да са повредени
    // Реши дали да продължиш или да хвърлиш отново
}`,
          },
          {
            title: 'Deadlock с два mutex-а',
            text: 'T1 вземе A, чака B. T2 вземе B, чака A. Никой не продължава. Решение: всички thread-ове взимат mutex-ите в един и същи ред.',
            code: `// Правилно: винаги взимай mtxA преди mtxB
mtxA.WaitOne(); // T1 и T2 се подреждат тук
mtxB.WaitOne();`,
          },
          {
            title: 'Грешен thread освобождава',
            text: 'Само owner thread-ът може да вика ReleaseMutex(). Опит от друг thread хвърля ApplicationException.',
            code: ``,
          },
        ]
      },
    ],
    speakerNotes: 'AbandonedMutexException е WaitHandle-специфично нещо — lock не може да го изрази. Това е сигнал, че данните зад mutex-а може да са в некоректно състояние.',
  },

  {
    id: 16, type: 'codegame', part: 'III',
    title: 'Предизвикателство — напиши Mutex',
    component: Game5,
    speakerNotes: 'Дайте 3-4 минути на учениците да попълнят кода сами. Кой финишира без ` е истинският победител. Припомнете: без finally блока мютексът може да остане заключен завинаги.',
  },

  // ─── Part IV ───────────────────────────────────────────────────────────────

  {
    id: 17, type: 'theory', part: 'IV',
    title: 'EventWaitHandle',
    sections: [
      {
        type: 'text',
        text: 'EventWaitHandle е базов клас на AutoResetEvent и ManualResetEvent. Различава се от Mutex по това, че няма thread affinity — всеки thread може да вика Set() и Reset().'
      },
      {
        type: 'code',
        lang: 'csharp',
        code: `// Двата начина за създаване
var auto   = new EventWaitHandle(false, EventResetMode.AutoReset);
var manual = new EventWaitHandle(false, EventResetMode.ManualReset);

// Именуван — cross-process
var named = new EventWaitHandle(
    false,
    EventResetMode.AutoReset,
    "Global\\\\MyEvent"
);

// Отваряне на вече съществуващ
var existing = EventWaitHandle.OpenExisting("Global\\\\MyEvent");`,
      },
      {
        type: 'list',
        items: [
          'Set()   — сигнализира event-а (събужда чакащи thread-ове)',
          'Reset() — маха сигнала (само ManualResetMode)',
          'Именуване: "Global\\\\" за cross-process, без prefix за local',
        ]
      },
    ],
    speakerNotes: 'EventWaitHandle обединява AutoResetEvent и ManualResetEvent под един API. Разликата е само в EventResetMode параметъра. Следващите слайдове разглеждат двата режима.',
  },

  {
    id: 18, type: 'theory', part: 'IV',
    title: 'AutoResetEvent — въведение',
    sections: [
      {
        type: 'text',
        text: 'AutoResetEvent работи като турникет. Всяко Set() пуска точно един чакащ thread. След като thread-ът мине, портата автоматично се затваря.'
      },
      {
        type: 'visual-metaphor',
        metaphor: 'turnstile',
        items: [
          { state: 'Несигнализиран', color: '#e8622a', desc: 'Всички thread-ове блокират при WaitOne()' },
          { state: 'Set() извикан', color: '#c9922a', desc: 'Точно един thread преминава' },
          { state: 'Auto Reset', color: '#3ec88a', desc: 'Портата се затваря — без допълнителен Reset()' },
        ]
      },
      {
        type: 'text',
        text: 'Ако Set() се извика без да има чакащи thread-ове, сигналът се запазва. Следващото WaitOne() ще мине без изчакване.'
      },
      {
        type: 'callout',
        label: 'Типична употреба',
        text: 'Producer-consumer: producer генерира едно задание, Set() събужда точно един consumer. Броят Set()-вания = брой преминали thread-ове.',
      },
    ],
    speakerNotes: 'Турникетът е добра метафора. Покажете с ръце ако трябва: едно натискане = един пасаж, после затваряне.',
  },

  {
    id: 19, type: 'theory', part: 'IV',
    title: 'AutoResetEvent — код',
    sections: [
      {
        type: 'code',
        lang: 'csharp',
        code: `var dataReady = new AutoResetEvent(false);
var queue = new Queue<string>();
var lockObj = new object();

// Consumer thread — чака данни
Task.Run(() =>
{
    while (true)
    {
        dataReady.WaitOne();          // блокира тук

        string item;
        lock (lockObj) { item = queue.Dequeue(); }

        Console.WriteLine($"Обработвам: {item}");
        // Gate се е затворил автоматично след WaitOne
    }
});

// Producer thread — генерира данни
foreach (var item in GetItems())
{
    lock (lockObj) { queue.Enqueue(item); }
    dataReady.Set();   // събужда точно един consumer
}`,
      },
      {
        type: 'text',
        text: 'Забелязвай: lock защитава queue-то (in-process), а AutoResetEvent сигнализира за ново задание. Двете примитиви решават различни проблеми.'
      },
    ],
    speakerNotes: 'Подчертайте: dataReady.Set() и lock(lockObj) правят различни неща. Set() е сигнал, lock е mutex за queue-то. В реален код вероятно бихте използвали BlockingCollection<T>, но тук показваме принципа.',
  },

  {
    id: 20, type: 'game', part: 'IV',
    title: 'Игра 3 — Турникетът',
    component: Game3,
    speakerNotes: 'Всяко натискане на Set() трябва да пусне точно един thread. Брояците "Set() извикан" и "Преминали thread-ове" трябва да съвпадат.',
  },

  {
    id: 21, type: 'theory', part: 'IV',
    title: 'ManualResetEvent — въведение',
    sections: [
      {
        type: 'text',
        text: 'ManualResetEvent работи като светофар. Един Set() отваря портата за ВСИЧКИ чакащи thread-ове. Портата остава отворена до следващото Reset().'
      },
      {
        type: 'visual-metaphor',
        metaphor: 'traffic',
        items: [
          { state: 'Reset() — червено', color: '#e8622a', desc: 'Всички thread-ове блокират при WaitOne()' },
          { state: 'Set() — зелено', color: '#3ec88a', desc: 'Всички чакащи и бъдещи thread-ове минават' },
          { state: 'Reset() отново', color: '#e8622a', desc: 'Портата се затваря — нов WaitOne() ще блокира' },
        ]
      },
      {
        type: 'callout',
        label: 'Типична употреба',
        text: 'Initialization barrier: много worker thread-ове чакат конфигурацията да се зареди. Един Set() стартира всички едновременно.',
      },
    ],
    speakerNotes: 'Разликата с Auto: при Manual, Set() е broadcast — всички минават. При Auto, Set() е unicast — само един минава. Следващата игра показва тази разлика директно.',
  },

  {
    id: 22, type: 'theory', part: 'IV',
    title: 'ManualResetEvent — код',
    sections: [
      {
        type: 'code',
        lang: 'csharp',
        code: `var initialized = new ManualResetEvent(false);

// 5 worker threads стартират, но чакат сигнал
var workers = Enumerable.Range(0, 5).Select(id =>
    Task.Run(() =>
    {
        Console.WriteLine($"Worker {id}: чакам...");
        initialized.WaitOne();   // всички блокират тук
        DoWork(id);               // стартират едновременно
    })
).ToArray();

// Инициализацията приключи
LoadConfiguration();
DatabaseConnection.Open();

initialized.Set();        // отваря портата за всички 5
// Портата ОСТАВА отворена — нови WaitOne() минават веднага

Task.WaitAll(workers);

// При нужда от ново блокиране:
initialized.Reset();      // затвори отново`,
      },
      {
        type: 'text',
        text: 'След Set(), ManualResetEvent остава сигнализиран. Всяко следващо WaitOne() ще мине без изчакване докато не се извика Reset().'
      },
    ],
    speakerNotes: 'Initialization barrier е класически pattern. Без ManualResetEvent би трябвало да използвате CountdownEvent или Barrier — но те са по-сложни.',
  },

  {
    id: 23, type: 'game', part: 'IV',
    title: 'Игра 4 — Светофарът',
    component: Game4,
    speakerNotes: 'Нека учениците превключат между Auto и Manual режим и приложат едни и същи действия — Set(), Reset(). Разликата в броя преминали thread-ове е ключова.',
  },

  {
    id: 24, type: 'codegame', part: 'IV',
    title: 'Предизвикателство — напиши AutoResetEvent',
    component: Game6,
    speakerNotes: 'Producer-Consumer е един от най-честите pattern-и. Учениците трябва да разберат защо конструкторът получава false (начално заключено) и защо само един thread минава при AutoReset.',
  },

  // ─── Part V ────────────────────────────────────────────────────────────────

  {
    id: 25, type: 'interactive', part: 'V',
    title: 'Сравнителна таблица',
    component: CompareTable,
    speakerNotes: 'Оставете учениците да сортират по колона. Питайте кое е единствения с thread affinity. Кое е cross-process без именуване? (Никое — всички изискват имена за cross-process.)',
  },

  {
    id: 26, type: 'interactive', part: 'V',
    title: 'Кога кое да използвам?',
    component: FlowChart,
    speakerNotes: 'Нека учениците кликнат различни сценарии. Целта е да разпознаят кой признак (cross-process? broadcast? ownership?) води до коя примитива.',
  },

  {
    id: 27, type: 'theory', part: 'V',
    title: 'Често срещани грешки',
    sections: [
      {
        type: 'pitfall-list',
        items: [
          {
            title: '1. WaitOne() без timeout',
            text: 'Ако другият thread никога не сигнализира (поради bug), calling thread-ът виси завинаги.',
            code: `// Проблем
mtx.WaitOne();

// По-добре
if (!mtx.WaitOne(5000))
    throw new TimeoutException("Mutex не освободен навреме.");`,
          },
          {
            title: '2. Dispose по-рано от последния потребител',
            text: 'Ако DisposE-неш WaitHandle докато друг thread е в WaitOne(), получаваш ObjectDisposedException.',
            code: `// Трябва да изчакаш всички thread-ове преди Dispose`,
          },
          {
            title: '3. WaitAll() с Mutex на Windows',
            text: 'WaitAll() с Mutex в масива не работи ако извикващият thread вече притежава един от mutex-ите. Хвърля DuplicateWaitObjectException.',
            code: ``,
          },
          {
            title: '4. Загубен Set() при AutoResetEvent',
            text: 'Ако Set() се извика преди WaitOne(), сигналът се запазва — но само един. Втори Set() без чакащ thread губи сигнала.',
            code: ``,
          },
          {
            title: '5. Грешна Reset логика при ManualResetEvent',
            text: 'Reset() трябва да е синхронизиран — ако се вика по време на Set(), нов thread може да влезе или да не влезе.',
            code: ``,
          },
        ]
      },
    ],
    speakerNotes: 'Грешка #1 е най-честата в production код. Timeout + fallback логика е правилният pattern. Грешка #5 изисква допълнителен lock за защита на ManualResetEvent state-а.',
  },

  {
    id: 28, type: 'theory', part: 'V',
    title: 'Performance бележки',
    sections: [
      {
        type: 'text',
        text: 'Kernel-level синхронизация има измеримо по-висок overhead поради syscall-а. Изборът трябва да е съзнателен.'
      },
      {
        type: 'perf-table',
        rows: [
          { primitive: 'lock (Monitor.Enter)', cost: '~10–20 ns', note: 'Само CAS + user space' },
          { primitive: 'Monitor.Wait / Pulse',  cost: '~50–100 ns', note: 'Плюс scheduler interaction' },
          { primitive: 'Mutex.WaitOne',         cost: '~200–500 ns', note: 'Syscall + kernel mode switch' },
          { primitive: 'AutoResetEvent.WaitOne',cost: '~200–500 ns', note: 'Syscall + kernel mode switch' },
          { primitive: 'SemaphoreSlim (0 count)',cost: '~100–200 ns', note: 'Hybrid: user + kernel при нужда' },
        ]
      },
      {
        type: 'callout',
        label: 'Препоръка',
        text: 'Използвай lock или SemaphoreSlim за in-process синхронизация. Преминавай към WaitHandle само когато имаш нужда от cross-process достъп или именувани ресурси.',
      },
    ],
    speakerNotes: 'Числата са ориентировъчни и зависят от CPU и OS. Важното: WaitHandle е 10–50x по-бавен от lock. В loop с хиляди итерации разликата е видима.',
  },

  {
    id: 29, type: 'quiz', part: 'V',
    title: 'Финален тест',
    component: Quiz,
    speakerNotes: '6 въпроса — 3 drag-drop, 3 multiple choice. Резултатът е само за самооценка. Нека учениците работят самостоятелно.',
  },

  // ─── Part VI ───────────────────────────────────────────────────────────────

  {
    id: 30, type: 'interactive', part: 'VI',
    title: 'Обобщение',
    component: InheritanceTree,
    recap: true,
    sections: [
      {
        type: 'takeaways',
        items: [
          { accent: '', text: 'WaitHandle обвива kernel object — по-скъп от lock, но видим cross-process.' },
          { accent: 'mutex', text: 'Mutex — само owner thread освобождава; подходящ за cross-process mutual exclusion.' },
          { accent: 'auto', text: 'AutoResetEvent — Set() събужда точно един thread, портата се затваря автоматично.' },
          { accent: 'manual', text: 'ManualResetEvent — Set() е broadcast; портата остава отворена до Reset().' },
          { accent: '', text: 'Правило: lock за in-process, WaitHandle само когато трябва kernel-level синхронизация.' },
        ]
      },
    ],
    speakerNotes: 'Петте точки са основните неща, които учениците трябва да запомнят. Помолете ги да ги кажат с думите си.',
  },

  {
    id: 31, type: 'theory', part: 'VI',
    title: 'Въпроси / Благодаря',
    sections: [
      {
        type: 'qa-slide',
        sources: [
          { title: 'Microsoft Learn — WaitHandle Class', url: 'https://learn.microsoft.com/dotnet/api/system.threading.waithandle' },
          { title: 'Microsoft Learn — Mutex Class', url: 'https://learn.microsoft.com/dotnet/api/system.threading.mutex' },
          { title: 'Albahari, J. — "Threading in C#"', url: 'https://www.albahari.com/threading/' },
          { title: 'Richter, J. — CLR via C# (глава 29)', url: '' },
        ]
      },
    ],
    speakerNotes: 'Оставете 5 минути за въпроси. Ако времето е напреднало, насочвайте към Microsoft Learn за самостоятелна работа.',
  },
]
