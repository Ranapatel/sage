import { MMTTrainProvider } from '../src/providers/makemytrip/MMTTrainProvider';

describe('MMTTrainProvider search & parsing', () => {
  let provider: MMTTrainProvider;

  beforeEach(() => {
    provider = new MMTTrainProvider();
  });

  it('should parse erail response correctly', async () => {
    const rawResponse = `~SC~Secunderabad Jn~MAO~Madgaon~~2026-6-28-13-22-47~~~^17322~JSME VSG EXP~Jasidih Jn~JSME~Vasco Da Gama~VSG~Secunderabad Jn~SC~Madgaon~MAO~19.05~13.25~18.20~0100000~~~~~~~~011001011000000~10~5~0~22~13.10~14.55~37~1000000~18.55~13.30~MAIL_EXPRESS~359~3~0~DATASOURCE_IR~2026-06-28~2031-06-30~877~48~MAIL_EXPRESS:877:,,,,,:1750,830,1025,510,865,1330:1235,580,715,355,600,925:,,,,,:,,,,,:470,215,265,135,225,340:,,,,,:1145,0,0,330,0,540:230,115,230,0,230,230:,,,,,:,,,,,:,,,,,:,,,,,:,,,,,:,,,,,~0~0~~60~2~~~~Mail & Express~~1~SWR~~BG~~~100000100000~,,En:LPR,LPR,LPR:GN,GN,GN:GN,GN,GN:GN,GN,GN:S,S2,SL:S,S1,SL:PC,PC,PC:M,M3,3E:M,M2,3E:M,M1,3E:B,B4,3A:B,B3,3A:B,B2,3A:B,B1,3A:A,A3,2A:A,A2,2A:A,A1,2A:GN,GN,GN:GN,GN,GN:LPR,LPR,LPR:~0~1~2A:14:32::16:::::::|2S:::::::::::|3A:24:103::20:::::::2|3E:22::::::::::|SL:8:24::14::6:::::4|~~~~~~~~~Lokmanyatilak Hubli Jn HUBLI EXPRESS~~~~~1~`;

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(rawResponse),
      })
    ) as any;

    const results = await provider.search({
      originStation: 'SC',
      destinationStation: 'MAO',
      travelDate: '2026-06-28',
      passengers: 1,
    });

    expect(results).toHaveLength(1);
    const train = results[0];
    expect(train.trainNumber).toBe('17322');
    expect(train.trainName).toBe('JSME VSG EXP');
    expect(train.departure).toBe('19:05');
    expect(train.arrival).toBe('13:25');
    expect(train.duration).toBe('18h 20m');
    expect(train.runsOn).toContain('Mon'); // "0100000" starting with Sunday => Mon is 1
    
    // Check class availability and pricing
    const slClass = train.availableClasses.find(c => c.class === 'SL');
    expect(slClass).toBeDefined();
    expect(slClass?.available).toBe(true);
    expect(slClass?.availability).toBe('AVAILABLE');
    expect(slClass?.price).toBe(470); // correct fare group

    const class3A = train.availableClasses.find(c => c.class === '3A');
    expect(class3A).toBeDefined();
    expect(class3A?.available).toBe(true);
    expect(class3A?.availability).toBe('AVAILABLE');
    expect(class3A?.price).toBe(1145); // correct fare group
  });
});
