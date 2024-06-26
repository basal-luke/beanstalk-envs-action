import * as utils from '../src/utils';

let originalProcessEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalProcessEnv = { ...process.env };
});

afterEach(() => {
  process.env = originalProcessEnv;
});

describe('utils: extractYamlKey', () => {
  it('should return MY_YAML_KEY', () => {
    const result = utils.extractYamlKey(
      'SOMETHING_SOMETHING_INPUT_EBX_MY_YAML_KEY'
    );
    expect(result).toBe('MY_YAML_KEY');
  });

  it('should return hello___world', () => {
    const result = utils.extractYamlKey('_INPUT_EBX_hello___world');
    expect(result).toBe('hello___world');
  });
});

describe('utils: findDuplicateEntries', () => {
  it('should return an array of 1 duplicate [same length arrays]', () => {
    const arr1 = [
      { key: 'test_a', value: 1 },
      { key: 'test_b', value: 2 },
      { key: 'test_c', value: 3 }
    ];
    const arr2 = [
      { key: 'test_a', value: 100 },
      { key: 'test_x', value: 101 },
      { key: 'test_y', value: 102 }
    ];
    const result = utils.findDuplicateEntries(arr1, arr2);
    expect(result.length).toBe(1);
  });

  it('should return an array of 1 duplicate [different length arrays]', () => {
    const arr1 = [
      { key: 'test_a', value: 1 },
      { key: 'test_b', value: 2 },
      { key: 'test_c', value: 3 },
      { key: 'test_d', value: 4 }
    ];
    const arr2 = [
      { key: 'test_a', value: 100 },
      { key: 'test_x', value: 101 }
    ];
    const result = utils.findDuplicateEntries(arr1, arr2);
    expect(result.length).toBe(1);
  });
});

describe('utils: extractEntries', () => {
  describe('success', () => {
    it('should return parsed json in { key: string; value: any }[] format (single item)', () => {
      const jsonInput = { my_var_key: 'json_test' };
      const result = utils.extractEntries(
        JSON.stringify(jsonInput),
        process.env
      );
      expect(result).toEqual([{ key: 'my_var_key', value: 'json_test' }]);
    });

    it('should return parsed json in { key: string; value: any }[] format (multiple items)', () => {
      const jsonInput = {
        my_var_key_1: 'mock_value_1',
        my_var_key_2: 'mock_value_2'
      };
      const result = utils.extractEntries(
        JSON.stringify(jsonInput),
        process.env
      );
      expect(result.length).toBe(2);
      expect(result).toEqual([
        { key: 'my_var_key_1', value: 'mock_value_1' },
        { key: 'my_var_key_2', value: 'mock_value_2' }
      ]);
    });

    it('should return parsed yaml inputs in { key: string; value: any }[] format', () => {
      process.env['INPUT_EBX_my_var_key_1'] = 'mock_value_1';
      process.env['INPUT_EBX_my_var_key_2'] = 'mock_value_2';
      const result = utils.extractEntries('{}', process.env);
      expect(result.length).toBe(2);
      expect(result).toEqual([
        { key: 'my_var_key_1', value: 'mock_value_1' },
        { key: 'my_var_key_2', value: 'mock_value_2' }
      ]);
    });

    it('should return a mixture of parsed yaml and json inputs in { key: string; value: any }[] format', () => {
      process.env['INPUT_EBX_my_var_key_1'] = 'mock_value_1';
      const jsonInput = { my_var_key_2: 'mock_value_2' };
      const result = utils.extractEntries(
        JSON.stringify(jsonInput),
        process.env
      );
      expect(result.length).toBe(2);
      expect(result).toEqual([
        { key: 'my_var_key_1', value: 'mock_value_1' },
        { key: 'my_var_key_2', value: 'mock_value_2' }
      ]);
    });

    it('should return a sorted list in { key: string; value: any }[] format', () => {
      process.env['INPUT_EBX_orange'] = 'mock_value_1';
      process.env['INPUT_EBX_banana'] = 'mock_value_2';
      const jsonInput = { apple: 'mock_value_3', pineapple: 'mock_value_4' };
      const shouldSort = true;
      const result = utils.extractEntries(
        JSON.stringify(jsonInput),
        process.env,
        shouldSort
      );
      expect(result.length).toBe(4);
      expect(result).toEqual([
        { key: 'apple', value: 'mock_value_3' },
        { key: 'banana', value: 'mock_value_2' },
        { key: 'orange', value: 'mock_value_1' },
        { key: 'pineapple', value: 'mock_value_4' }
      ]);
    });

    it('should return entries array even though empty string value is passed (fail_on_empty=`false`)', () => {
      const result = utils.extractEntries(
        JSON.stringify({ mock_a: '' }),
        process.env
      );
      expect(result).toEqual([{ key: 'mock_a', value: '' }]);
    });

    it('should return entries array even though null string value is passed (fail_on_empty=`false`)', () => {
      const result = utils.extractEntries(
        JSON.stringify({ mock_a: null }),
        process.env
      );
      expect(result).toEqual([{ key: 'mock_a', value: null }]);
    });
  });

  describe('error handling', () => {
    it('should return an empty array when invalid json is passed (invalid ,)', () => {
      const result = utils.extractEntries('{},', process.env);
      expect(result).toEqual([]);
    });

    it('should return an empty array when invalid json is passed (missing quotes)', () => {
      const result = utils.extractEntries(
        `{ missing_quotes: 'missing_closing_quote }`,
        process.env
      );
      expect(result).toEqual([]);
    });

    it('should return an empty array when empty string value is passed and fail_on_empty is `true`', () => {
      const shouldFailOnEmpty = true;
      const result = utils.extractEntries(
        JSON.stringify({ mock_a: '' }),
        process.env,
        false,
        shouldFailOnEmpty
      );
      expect(result).toEqual([]);
    });

    it('should return an empty array when null value is passed and fail_on_empty is `true`', () => {
      const shouldFailOnEmpty = true;
      const result = utils.extractEntries(
        JSON.stringify({ mock_a: null }),
        process.env,
        false,
        shouldFailOnEmpty
      );
      expect(result).toEqual([]);
    });
  });
});
