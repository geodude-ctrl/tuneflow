import { Song, TuneflowPlugin } from '../src';
import { StructureType } from '../src/models/marker';

describe('Song-related Tests', () => {
  class TestUtilsPlugin extends TuneflowPlugin {}

  const testUtilsPlugin = new TestUtilsPlugin();
  let song = new Song();

  beforeEach(() => {
    song = new Song();
    // @ts-ignore
    song.setPluginContextInternal(testUtilsPlugin);
    song.setResolution(480);
    song.createTempoChange({
      ticks: 0,
      bpm: 120,
    });
    song.createTempoChange({
      ticks: 1440,
      bpm: 60,
    });
    song.createTimeSignature({ ticks: 0, numerator: 4, denominator: 4 });
    song.createTimeSignature({ ticks: 2880, numerator: 7, denominator: 8 });
  });
  describe('Creates song correctly', () => {
    const newSong = Song.create();
    expect(newSong.getResolution()).toBe(480);
    expect(newSong.getTempoChanges().length).toBe(1);
    expect(newSong.getTempoChanges()[0].getBpm()).toBe(120);
    expect(newSong.getTempoChanges()[0].getTicks()).toBe(0);
    expect(newSong.getTimeSignatures().length).toBe(1);
    expect(newSong.getTimeSignatures()[0].getNumerator()).toBe(4);
    expect(newSong.getTimeSignatures()[0].getDenominator()).toBe(4);
    expect(newSong.getTimeSignatures()[0].getTicks()).toBe(0);
  });

  describe('Works with tempos correctly', () => {
    it('Gets tempo at tick correctly', async () => {
      expect(song.getTempoAtTick(-10).getTicks()).toBe(0);
      expect(song.getTempoAtTick(-10).getBpm()).toBe(120);
      expect(song.getTempoAtTick(0).getTicks()).toBe(0);
      expect(song.getTempoAtTick(0).getBpm()).toBe(120);
      expect(song.getTempoAtTick(10).getTicks()).toBe(0);
      expect(song.getTempoAtTick(10).getBpm()).toBe(120);
      expect(song.getTempoAtTick(1439).getTicks()).toBe(0);
      expect(song.getTempoAtTick(1439).getBpm()).toBe(120);
      expect(song.getTempoAtTick(1440).getTicks()).toBe(1440);
      expect(song.getTempoAtTick(1440).getBpm()).toBe(60);
      expect(song.getTempoAtTick(1441).getTicks()).toBe(1440);
      expect(song.getTempoAtTick(1441).getBpm()).toBe(60);
      expect(song.getTempoAtTick(9999).getTicks()).toBe(1440);
      expect(song.getTempoAtTick(9999).getBpm()).toBe(60);
    });

    it('Move tempo non-overlapping correctly', async () => {
      song.createTempoChange({
        ticks: 2880,
        bpm: 240,
      });
      expect(song.getTempoChanges().length).toBe(3);
      expect(() => song.moveTempo(1, 0)).toThrowError();
      song.moveTempo(1, 480);
      expect(song.getTempoChanges().length).toBe(3);
      expect(song.getTempoChanges()[0].getBpm()).toBe(120);
      expect(song.getTempoChanges()[0].getTime()).toBe(0);
      expect(song.getTempoChanges()[1].getBpm()).toBe(60);
      expect(song.getTempoChanges()[1].getTime()).toBeCloseTo(0.5);
      expect(song.getTempoChanges()[2].getBpm()).toBe(240);
      expect(song.getTempoChanges()[2].getTime()).toBeCloseTo(5.5);
    });

    it('Move tempo past another correctly', async () => {
      song.createTempoChange({
        ticks: 2880,
        bpm: 240,
      });
      expect(song.getTempoChanges().length).toBe(3);
      song.moveTempo(1, 3360);
      expect(song.getTempoChanges().length).toBe(3);
      expect(song.getTempoChanges()[0].getBpm()).toBe(120);
      expect(song.getTempoChanges()[0].getTime()).toBe(0);
      expect(song.getTempoChanges()[1].getBpm()).toBe(240);
      expect(song.getTempoChanges()[1].getTime()).toBeCloseTo(3);
      expect(song.getTempoChanges()[2].getBpm()).toBe(60);
      expect(song.getTempoChanges()[2].getTime()).toBeCloseTo(3.25);
    });

    it('Move tempo overwrite correctly', async () => {
      song.createTempoChange({
        ticks: 2880,
        bpm: 240,
      });
      expect(song.getTempoChanges().length).toBe(3);
      expect(() => song.moveTempo(1, 0)).toThrowError();
      song.moveTempo(2, 1440);
      expect(song.getTempoChanges().length).toBe(2);
      expect(song.getTempoChanges()[0].getBpm()).toBe(120);
      expect(song.getTempoChanges()[1].getBpm()).toBe(240);
    });

    it('Remove tempo correctly', async () => {
      expect(() => song.removeTempoChange(0)).toThrowError();
      song.removeTempoChange(1);
      expect(song.getTempoChanges().length).toBe(1);
      expect(song.getTempoChanges()[0].getBpm()).toBe(120);
      expect(() => song.removeTempoChange(0)).toThrowError();
    });
  });

  describe('Works with time signatures correctly', () => {
    it('Move time signature non-overlapping correctly', async () => {
      expect(song.getTimeSignatures().length).toBe(2);
      expect(() => song.moveTimeSignature(1, 0)).toThrowError();
      song.moveTimeSignature(1, 480);
      expect(song.getTimeSignatures().length).toBe(2);
      expect(song.getTimeSignatures()[0].getNumerator()).toBe(4);
      expect(song.getTimeSignatures()[0].getDenominator()).toBe(4);
      expect(song.getTimeSignatures()[1].getNumerator()).toBe(7);
      expect(song.getTimeSignatures()[1].getDenominator()).toBe(8);
    });

    it('Move time signature past another correctly', async () => {
      song.createTimeSignature({
        ticks: 480,
        numerator: 3,
        denominator: 4,
      });
      expect(song.getTimeSignatures().length).toBe(3);
      expect(song.getTimeSignatures()[0].getNumerator()).toBe(4);
      expect(song.getTimeSignatures()[0].getDenominator()).toBe(4);
      expect(song.getTimeSignatures()[1].getNumerator()).toBe(3);
      expect(song.getTimeSignatures()[1].getDenominator()).toBe(4);
      expect(song.getTimeSignatures()[2].getNumerator()).toBe(7);
      expect(song.getTimeSignatures()[2].getDenominator()).toBe(8);
      song.moveTimeSignature(1, 3360);
      expect(song.getTimeSignatures().length).toBe(3);
      expect(song.getTimeSignatures()[0].getNumerator()).toBe(4);
      expect(song.getTimeSignatures()[0].getDenominator()).toBe(4);
      expect(song.getTimeSignatures()[1].getNumerator()).toBe(7);
      expect(song.getTimeSignatures()[1].getDenominator()).toBe(8);
      expect(song.getTimeSignatures()[2].getNumerator()).toBe(3);
      expect(song.getTimeSignatures()[2].getDenominator()).toBe(4);
    });

    it('Move time signature overwrite correctly', async () => {
      song.createTimeSignature({
        ticks: 480,
        numerator: 3,
        denominator: 4,
      });
      expect(song.getTimeSignatures().length).toBe(3);
      expect(song.getTimeSignatures()[0].getNumerator()).toBe(4);
      expect(song.getTimeSignatures()[0].getDenominator()).toBe(4);
      expect(song.getTimeSignatures()[1].getNumerator()).toBe(3);
      expect(song.getTimeSignatures()[1].getDenominator()).toBe(4);
      expect(song.getTimeSignatures()[2].getNumerator()).toBe(7);
      expect(song.getTimeSignatures()[2].getDenominator()).toBe(8);
      song.moveTimeSignature(2, 480);
      expect(song.getTimeSignatures().length).toBe(2);
      expect(song.getTimeSignatures()[0].getNumerator()).toBe(4);
      expect(song.getTimeSignatures()[0].getDenominator()).toBe(4);
      expect(song.getTimeSignatures()[1].getNumerator()).toBe(7);
      expect(song.getTimeSignatures()[1].getDenominator()).toBe(8);
    });

    it('Remove time signature correctly', async () => {
      expect(song.getTimeSignatures().length).toBe(2);
      expect(() => song.removeTimeSignature(0)).toThrowError();
      song.removeTimeSignature(1);
      expect(song.getTimeSignatures().length).toBe(1);
      expect(song.getTimeSignatures()[0].getNumerator()).toBe(4);
      expect(song.getTimeSignatures()[0].getDenominator()).toBe(4);
      expect(() => song.removeTimeSignature(0)).toThrowError();
    });

    it('Gets time signature at tick correctly', async () => {
      expect(song.getTimeSignatureAtTick(-10).getTicks()).toBe(0);
      expect(song.getTimeSignatureAtTick(-10).getNumerator()).toBe(4);
      expect(song.getTimeSignatureAtTick(-10).getDenominator()).toBe(4);
      expect(song.getTimeSignatureAtTick(0).getTicks()).toBe(0);
      expect(song.getTimeSignatureAtTick(0).getNumerator()).toBe(4);
      expect(song.getTimeSignatureAtTick(0).getDenominator()).toBe(4);
      expect(song.getTimeSignatureAtTick(10).getTicks()).toBe(0);
      expect(song.getTimeSignatureAtTick(10).getNumerator()).toBe(4);
      expect(song.getTimeSignatureAtTick(10).getDenominator()).toBe(4);
      expect(song.getTimeSignatureAtTick(1440).getTicks()).toBe(0);
      expect(song.getTimeSignatureAtTick(1440).getNumerator()).toBe(4);
      expect(song.getTimeSignatureAtTick(1440).getDenominator()).toBe(4);
      expect(song.getTimeSignatureAtTick(2880).getTicks()).toBe(2880);
      expect(song.getTimeSignatureAtTick(2880).getNumerator()).toBe(7);
      expect(song.getTimeSignatureAtTick(2880).getDenominator()).toBe(8);
      expect(song.getTimeSignatureAtTick(2881).getTicks()).toBe(2880);
      expect(song.getTimeSignatureAtTick(2881).getNumerator()).toBe(7);
      expect(song.getTimeSignatureAtTick(2881).getDenominator()).toBe(8);
      expect(song.getTimeSignatureAtTick(9999).getTicks()).toBe(2880);
      expect(song.getTimeSignatureAtTick(9999).getNumerator()).toBe(7);
      expect(song.getTimeSignatureAtTick(9999).getDenominator()).toBe(8);
    });
  });

  describe('Works with structures correctly', () => {
    it('Gets structure at index correctly', async () => {
      expect(song.getStructureAtIndex(0)).toBeUndefined();

      song.createStructure({
        tick: 0,
        type: StructureType.INTRO,
      });

      song.createStructure({
        tick: 480,
        type: StructureType.VERSE,
      });

      song.createStructure({
        tick: 960,
        type: StructureType.CUSTOM,
        customName: 'myStructure',
      });

      expect(song.getStructureAtIndex(0).getTick()).toBe(0);
      expect(song.getStructureAtIndex(0).getType()).toBe(StructureType.INTRO);

      expect(song.getStructureAtIndex(1).getTick()).toBe(480);
      expect(song.getStructureAtIndex(1).getType()).toBe(StructureType.VERSE);

      expect(song.getStructureAtIndex(2).getTick()).toBe(960);
      expect(song.getStructureAtIndex(2).getType()).toBe(StructureType.CUSTOM);
      expect(song.getStructureAtIndex(2).getCustomName()).toBe('myStructure');
    });

    it('updates structure correctly', async () => {
      expect(song.getStructureAtIndex(0)).toBeUndefined();

      song.createStructure({
        tick: 0,
        type: StructureType.INTRO,
      });

      expect(song.getStructureAtIndex(0).getTick()).toBe(0);
      expect(song.getStructureAtIndex(0).getType()).toBe(StructureType.INTRO);
      expect(song.getStructureAtIndex(0).getCustomName()).toBeUndefined();

      song.getStructureAtIndex(0).setType(StructureType.CUSTOM);
      song.getStructureAtIndex(0).setCustomName('myStructure');

      expect(song.getStructureAtIndex(0).getType()).toBe(StructureType.CUSTOM);
      expect(song.getStructureAtIndex(0).getCustomName()).toBe('myStructure');
    });

    it('Gets structure at tick correctly', async () => {
      expect(song.getStructureAtTick(0)).toBeUndefined();
      expect(song.getStructureAtTick(-1)).toBeUndefined();

      song.createStructure({
        tick: 0,
        type: StructureType.INTRO,
      });

      song.createStructure({
        tick: 480,
        type: StructureType.VERSE,
      });

      expect(song.getStructureAtTick(-1).getTick()).toBe(0);
      expect(song.getStructureAtTick(-1).getType()).toBe(StructureType.INTRO);

      expect(song.getStructureAtTick(0).getTick()).toBe(0);
      expect(song.getStructureAtTick(0).getType()).toBe(StructureType.INTRO);

      expect(song.getStructureAtTick(240).getTick()).toBe(0);
      expect(song.getStructureAtTick(240).getType()).toBe(StructureType.INTRO);

      expect(song.getStructureAtTick(480).getTick()).toBe(480);
      expect(song.getStructureAtTick(480).getType()).toBe(StructureType.VERSE);

      expect(song.getStructureAtTick(960).getTick()).toBe(480);
      expect(song.getStructureAtTick(960).getType()).toBe(StructureType.VERSE);
    });

    it('Create first structure from non-0 tick', async () => {
      song.createStructure({
        tick: 480,
        type: StructureType.INTRO,
      });
      expect(song.getStructureAtIndex(0).getTick()).toBe(0);
      expect(song.getStructureAtIndex(0).getType()).toBe(StructureType.INTRO);
    });

    it('Sort created structures correctly', async () => {
      song.createStructure({
        tick: 480,
        type: StructureType.INTRO,
      });
      song.createStructure({
        tick: 960,
        type: StructureType.VERSE,
      });
      song.createStructure({
        tick: 480,
        type: StructureType.OUTRO,
      });
      expect(song.getStructureAtIndex(0).getTick()).toBe(0);
      expect(song.getStructureAtIndex(0).getType()).toBe(StructureType.INTRO);
      expect(song.getStructureAtIndex(1).getTick()).toBe(480);
      expect(song.getStructureAtIndex(1).getType()).toBe(StructureType.OUTRO);
      expect(song.getStructureAtIndex(2).getTick()).toBe(960);
      expect(song.getStructureAtIndex(2).getType()).toBe(StructureType.VERSE);
    });

    it('Move structure non-overlapping correctly', async () => {
      song.createStructure({
        tick: 0,
        type: StructureType.INTRO,
      });
      song.createStructure({
        tick: 480,
        type: StructureType.VERSE,
      });
      song.createStructure({
        tick: 960,
        type: StructureType.CHORUS,
      });
      expect(song.getStructures().length).toBe(3);
      song.moveStructure(1, 240);
      expect(song.getStructures().length).toBe(3);
      expect(song.getStructures()[0].getType()).toBe(StructureType.INTRO);
      expect(song.getStructures()[0].getTick()).toBe(0);
      expect(song.getStructures()[1].getType()).toBe(StructureType.VERSE);
      expect(song.getStructures()[1].getTick()).toBe(240);
      expect(song.getStructures()[2].getType()).toBe(StructureType.CHORUS);
      expect(song.getStructures()[2].getTick()).toBe(960);
    });

    it('Move structure past another correctly', async () => {
      song.createStructure({
        tick: 0,
        type: StructureType.INTRO,
      });
      song.createStructure({
        tick: 480,
        type: StructureType.VERSE,
      });
      song.createStructure({
        tick: 960,
        type: StructureType.CHORUS,
      });
      expect(song.getStructures().length).toBe(3);
      song.moveStructure(1, 1920);
      expect(song.getStructures().length).toBe(3);
      expect(song.getStructures()[0].getType()).toBe(StructureType.INTRO);
      expect(song.getStructures()[0].getTick()).toBe(0);
      expect(song.getStructures()[1].getType()).toBe(StructureType.CHORUS);
      expect(song.getStructures()[1].getTick()).toBe(960);
      expect(song.getStructures()[2].getType()).toBe(StructureType.VERSE);
      expect(song.getStructures()[2].getTick()).toBe(1920);
    });

    it('Move structure overwrite correctly', async () => {
      song.createStructure({
        tick: 0,
        type: StructureType.INTRO,
      });
      song.createStructure({
        tick: 480,
        type: StructureType.VERSE,
      });
      song.createStructure({
        tick: 960,
        type: StructureType.CHORUS,
      });
      expect(song.getStructures().length).toBe(3);
      song.moveStructure(1, 960);
      expect(song.getStructures().length).toBe(2);
      expect(song.getStructures()[0].getType()).toBe(StructureType.INTRO);
      expect(song.getStructures()[0].getTick()).toBe(0);
      expect(song.getStructures()[1].getType()).toBe(StructureType.VERSE);
      expect(song.getStructures()[1].getTick()).toBe(960);
    });

    it('Move structure overwrite first correctly', async () => {
      song.createStructure({
        tick: 0,
        type: StructureType.INTRO,
      });
      song.createStructure({
        tick: 480,
        type: StructureType.VERSE,
      });
      song.createStructure({
        tick: 960,
        type: StructureType.CHORUS,
      });
      expect(song.getStructures().length).toBe(3);
      song.moveStructure(1, 0);
      expect(song.getStructures().length).toBe(2);
      expect(song.getStructures()[0].getType()).toBe(StructureType.VERSE);
      expect(song.getStructures()[0].getTick()).toBe(0);
      expect(song.getStructures()[1].getType()).toBe(StructureType.CHORUS);
      expect(song.getStructures()[1].getTick()).toBe(960);
    });

    it('Remove structure correctly', async () => {
      song.createStructure({
        tick: 0,
        type: StructureType.INTRO,
      });
      song.createStructure({
        tick: 480,
        type: StructureType.VERSE,
      });
      song.createStructure({
        tick: 960,
        type: StructureType.CHORUS,
      });
      expect(song.getStructures().length).toBe(3);

      song.removeStructure(1);
      expect(song.getTempoChanges().length).toBe(2);
      expect(song.getStructures()[0].getType()).toBe(StructureType.INTRO);
      expect(song.getStructures()[0].getTick()).toBe(0);
      expect(song.getStructures()[1].getType()).toBe(StructureType.CHORUS);
      expect(song.getStructures()[1].getTick()).toBe(960);
      song.removeStructure(3);
      song.removeStructure(-1);
      expect(song.getTempoChanges().length).toBe(2);
    });
  });

  describe('Gets bar beats correctly', () => {
    it('Gets bar beat when there are multiple time signatures correctly', () => {
      expect(song.getBarBeats(4570)).toEqual([
        { bar: 1, beat: 1, tick: 0, ticksPerBeat: 480, numerator: 4, denominator: 4 },
        { bar: 1, beat: 2, tick: 480 },
        { bar: 1, beat: 3, tick: 960 },
        { bar: 1, beat: 4, tick: 1440 },
        { bar: 2, beat: 1, tick: 1920, ticksPerBeat: 480, numerator: 4, denominator: 4 },
        { bar: 2, beat: 2, tick: 2400 },
        { bar: 3, beat: 1, tick: 2880, ticksPerBeat: 240, numerator: 7, denominator: 8 },
        { bar: 3, beat: 2, tick: 3120 },
        { bar: 3, beat: 3, tick: 3360 },
        { bar: 3, beat: 4, tick: 3600 },
        { bar: 3, beat: 5, tick: 3840 },
        { bar: 3, beat: 6, tick: 4080 },
        { bar: 3, beat: 7, tick: 4320 },
        { bar: 4, beat: 1, tick: 4560, ticksPerBeat: 240, numerator: 7, denominator: 8 },
      ]);
    });

    it('Gets bar beat when there are duplicate time signatures correctly', () => {
      song.createTimeSignature({ ticks: 480, numerator: 4, denominator: 4 });
      expect(song.getBarBeats(4570)).toEqual([
        { bar: 1, beat: 1, tick: 0, ticksPerBeat: 480, numerator: 4, denominator: 4 },
        { bar: 1, beat: 2, tick: 480 },
        { bar: 1, beat: 3, tick: 960 },
        { bar: 1, beat: 4, tick: 1440 },
        { bar: 2, beat: 1, tick: 1920, ticksPerBeat: 480, numerator: 4, denominator: 4 },
        { bar: 2, beat: 2, tick: 2400 },
        { bar: 3, beat: 1, tick: 2880, ticksPerBeat: 240, numerator: 7, denominator: 8 },
        { bar: 3, beat: 2, tick: 3120 },
        { bar: 3, beat: 3, tick: 3360 },
        { bar: 3, beat: 4, tick: 3600 },
        { bar: 3, beat: 5, tick: 3840 },
        { bar: 3, beat: 6, tick: 4080 },
        { bar: 3, beat: 7, tick: 4320 },
        { bar: 4, beat: 1, tick: 4560, ticksPerBeat: 240, numerator: 7, denominator: 8 },
      ]);
    });
  });

  describe('Gets closest/leading/trailing beats/bars correctly', () => {
    it('Gets closest beats correctly', () => {
      const barBeats = song.getBarBeats(5000);
      expect(Song.getClosestBeat(0, barBeats)).toEqual({
        bar: 1,
        beat: 1,
        tick: 0,
        ticksPerBeat: 480,
        numerator: 4,
        denominator: 4,
      });

      expect(Song.getClosestBeat(240, barBeats)).toEqual({
        bar: 1,
        beat: 1,
        tick: 0,
        ticksPerBeat: 480,
        numerator: 4,
        denominator: 4,
      });

      expect(Song.getClosestBeat(241, barBeats)).toEqual({
        bar: 1,
        beat: 2,
        tick: 480,
      });

      expect(Song.getClosestBeat(1660, barBeats)).toEqual({
        bar: 1,
        beat: 4,
        tick: 1440,
      });

      expect(Song.getClosestBeat(2640, barBeats)).toEqual({
        bar: 2,
        beat: 2,
        tick: 2400,
      });

      expect(Song.getClosestBeat(2641, barBeats)).toEqual({
        bar: 3,
        beat: 1,
        tick: 2880,
        ticksPerBeat: 240,
        numerator: 7,
        denominator: 8,
      });
    });

    it('Gets leading beats correctly', () => {
      const barBeats = song.getBarBeats(5000);
      expect(Song.getLeadingBeat(0, barBeats)).toEqual({
        bar: 1,
        beat: 1,
        tick: 0,
        ticksPerBeat: 480,
        numerator: 4,
        denominator: 4,
      });

      expect(Song.getLeadingBeat(480, barBeats)).toEqual({
        bar: 1,
        beat: 2,
        tick: 480,
      });

      expect(Song.getLeadingBeat(490, barBeats)).toEqual({
        bar: 1,
        beat: 2,
        tick: 480,
      });

      expect(Song.getLeadingBeat(1920, barBeats)).toEqual({
        bar: 2,
        beat: 1,
        tick: 1920,
        ticksPerBeat: 480,
        numerator: 4,
        denominator: 4,
      });

      expect(Song.getLeadingBeat(2779, barBeats)).toEqual({
        bar: 2,
        beat: 2,
        tick: 2400,
      });

      expect(Song.getLeadingBeat(2880, barBeats)).toEqual({
        bar: 3,
        beat: 1,
        tick: 2880,
        ticksPerBeat: 240,
        numerator: 7,
        denominator: 8,
      });

      expect(Song.getLeadingBeat(3119, barBeats)).toEqual({
        bar: 3,
        beat: 1,
        tick: 2880,
        ticksPerBeat: 240,
        numerator: 7,
        denominator: 8,
      });

      expect(Song.getLeadingBeat(3120, barBeats)).toEqual({
        bar: 3,
        beat: 2,
        tick: 3120,
      });

      expect(Song.getLeadingBeat(4559, barBeats)).toEqual({
        bar: 3,
        beat: 7,
        tick: 4320,
      });

      expect(Song.getLeadingBeat(4560, barBeats)).toEqual({
        bar: 4,
        beat: 1,
        tick: 4560,
        ticksPerBeat: 240,
        numerator: 7,
        denominator: 8,
      });
    });

    it('Gets trailing beats correctly', () => {
      const barBeats = song.getBarBeats(5000);
      expect(Song.getTrailingBeat(0, barBeats)).toEqual({
        bar: 1,
        beat: 1,
        tick: 0,
        ticksPerBeat: 480,
        numerator: 4,
        denominator: 4,
      });

      expect(Song.getTrailingBeat(480, barBeats)).toEqual({
        bar: 1,
        beat: 2,
        tick: 480,
      });

      expect(Song.getTrailingBeat(490, barBeats)).toEqual({
        bar: 1,
        beat: 3,
        tick: 960,
      });

      expect(Song.getTrailingBeat(1920, barBeats)).toEqual({
        bar: 2,
        beat: 1,
        tick: 1920,
        ticksPerBeat: 480,
        numerator: 4,
        denominator: 4,
      });

      expect(Song.getTrailingBeat(2779, barBeats)).toEqual({
        bar: 3,
        beat: 1,
        tick: 2880,
        ticksPerBeat: 240,
        numerator: 7,
        denominator: 8,
      });

      expect(Song.getTrailingBeat(2880, barBeats)).toEqual({
        bar: 3,
        beat: 1,
        tick: 2880,
        ticksPerBeat: 240,
        numerator: 7,
        denominator: 8,
      });

      expect(Song.getTrailingBeat(3119, barBeats)).toEqual({
        bar: 3,
        beat: 2,
        tick: 3120,
      });

      expect(Song.getTrailingBeat(3120, barBeats)).toEqual({
        bar: 3,
        beat: 2,
        tick: 3120,
      });

      expect(Song.getTrailingBeat(4319, barBeats)).toEqual({
        bar: 3,
        beat: 7,
        tick: 4320,
      });

      expect(Song.getTrailingBeat(4559, barBeats)).toEqual({
        bar: 4,
        beat: 1,
        tick: 4560,
        ticksPerBeat: 240,
        numerator: 7,
        denominator: 8,
      });

      expect(Song.getTrailingBeat(4560, barBeats)).toEqual({
        bar: 4,
        beat: 1,
        tick: 4560,
        ticksPerBeat: 240,
        numerator: 7,
        denominator: 8,
      });
    });

    it('Gets leading bars correctly', () => {
      const barBeats = song.getBarBeats(5000);

      expect(Song.getLeadingBar(-10, barBeats)).toEqual({
        bar: 1,
        beat: 1,
        tick: 0,
        ticksPerBeat: 480,
        numerator: 4,
        denominator: 4,
      });

      expect(Song.getLeadingBar(0, barBeats)).toEqual({
        bar: 1,
        beat: 1,
        tick: 0,
        ticksPerBeat: 480,
        numerator: 4,
        denominator: 4,
      });

      expect(Song.getLeadingBar(480, barBeats)).toEqual({
        bar: 1,
        beat: 1,
        tick: 0,
        ticksPerBeat: 480,
        numerator: 4,
        denominator: 4,
      });

      expect(Song.getLeadingBar(1920, barBeats)).toEqual({
        bar: 2,
        beat: 1,
        tick: 1920,
        ticksPerBeat: 480,
        numerator: 4,
        denominator: 4,
      });

      expect(Song.getLeadingBar(2779, barBeats)).toEqual({
        bar: 2,
        beat: 1,
        tick: 1920,
        ticksPerBeat: 480,
        numerator: 4,
        denominator: 4,
      });

      expect(Song.getLeadingBar(2880, barBeats)).toEqual({
        bar: 3,
        beat: 1,
        tick: 2880,
        ticksPerBeat: 240,
        numerator: 7,
        denominator: 8,
      });

      expect(Song.getLeadingBar(3119, barBeats)).toEqual({
        bar: 3,
        beat: 1,
        tick: 2880,
        ticksPerBeat: 240,
        numerator: 7,
        denominator: 8,
      });

      expect(Song.getLeadingBar(3120, barBeats)).toEqual({
        bar: 3,
        beat: 1,
        tick: 2880,
        ticksPerBeat: 240,
        numerator: 7,
        denominator: 8,
      });

      expect(Song.getLeadingBar(4559, barBeats)).toEqual({
        bar: 3,
        beat: 1,
        tick: 2880,
        ticksPerBeat: 240,
        numerator: 7,
        denominator: 8,
      });

      expect(Song.getLeadingBar(4560, barBeats)).toEqual({
        bar: 4,
        beat: 1,
        tick: 4560,
        ticksPerBeat: 240,
        numerator: 7,
        denominator: 8,
      });

      expect(Song.getLeadingBar(9999, barBeats)).toEqual({
        bar: 4,
        beat: 1,
        tick: 4560,
        ticksPerBeat: 240,
        numerator: 7,
        denominator: 8,
      });
    });
  });

  describe('Gets/Sets buses correctly', () => {
    it('Gets/Sets buses correctly', async () => {
      expect(song.getBusByRank(1)).toBeUndefined();
      song.setBus(/* rank= */ 1, 'Reverb');
      expect(song.getBusByRank(1).getRank()).toBe(1);
      expect(song.getBusByRank(1).getName()).toBe('Reverb');

      song.setBus(32, 'Compress');
      expect(song.getBusByRank(32).getRank()).toBe(32);
      expect(song.getBusByRank(32).getName()).toBe('Compress');

      expect(() => song.setBus(33, 'test bus')).toThrow();
    });
  });
});
