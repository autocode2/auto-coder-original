import { parseXmlOutput, XmlOutputHandlers } from './xmlUtils';
import { Builder } from 'xml2js';

describe('parseXmlOutput', () => {
  let mockHandlers: jest.Mocked<XmlOutputHandlers>;
  let xmlBuilder: Builder;

  beforeEach(() => {
    mockHandlers = {
      onThinking: jest.fn(),
      onMessage: jest.fn(),  
      onCommand: jest.fn(),
      onPatch: jest.fn(),
      onError: jest.fn(),
    };
    xmlBuilder = new Builder({ cdata: true });
  });

  it('calls onThinking handler with contents', async () => {
    const xml = xmlBuilder.buildObject({ 
      Thinking: 'Some thoughts'
    });
    await parseXmlOutput(xml, mockHandlers);

    expect(mockHandlers.onThinking).toHaveBeenCalledWith('Some thoughts');
  });

  it('calls onMessage handler with contents', async () => {
    const xml = xmlBuilder.buildObject({
      Message: 'Hello world' 
    });

    await parseXmlOutput(xml, mockHandlers);

    expect(mockHandlers.onMessage).toHaveBeenCalledWith('Hello world');
  });

  it('calls onCommand handler with contents', async () => {
    const xml = xmlBuilder.buildObject({
      Command: 'echo "test"' 
    });

    await parseXmlOutput(xml, mockHandlers);

    expect(mockHandlers.onCommand).toHaveBeenCalledWith('echo "test"');
  });

  it('calls onPatch handler with filename and contents', async () => {
    const xml = xmlBuilder.buildObject({
      Patch: {
        _: 'console.log("test")',
        $: { filename: 'test.js' }
      }
    });

    await parseXmlOutput(xml, mockHandlers);

    expect(mockHandlers.onPatch).toHaveBeenCalledWith('test.js', 'console.log("test")');
  });

  it('calls onError if Patch is missing filename', async () => {
    const xml = xmlBuilder.buildObject({
      Patch: 'console.log("test")'  
    });

    await parseXmlOutput(xml, mockHandlers);

    expect(mockHandlers.onError).toHaveBeenCalledWith('<Patch> is missing required filename attribute');
  });

  it('calls onError for unknown tags', async () => {
    const xml = xmlBuilder.buildObject({
      UnknownTag: 'test'
    });

    await parseXmlOutput(xml, mockHandlers);

    expect(mockHandlers.onError).toHaveBeenCalledWith('Unknown tag <UnknownTag>');
  });
});
