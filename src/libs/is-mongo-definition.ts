import { IMongoClient, IMongoDefinition } from '../../types';

/**
 * @description Returns if parametr is IMongoClient or IMongoDefinition
 *
 * @param {(IMongoClient | IMongoDefinition)} client
 * @return {*}  {client is IMongoDefinition}
 * @see https://stackoverflow.com/questions/14425568/interface-type-check-with-typescript -> How about User-Defined Type Guards?
 */
export function isMongoDefinition(
    client: IMongoClient | IMongoDefinition
): client is IMongoDefinition {
    return (<IMongoDefinition>client).collection !== undefined;
}
