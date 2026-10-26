import {
  QuestionnaireContentUpdatedDocument,
  QuestionnairePublishedContentsByQuestionnaireIdDocument,
} from '@gql/generated/graphql';
import { DocumentNode, visit } from 'graphql';

function selectedFields(document: DocumentNode): Set<string> {
  const fields = new Set<string>();
  visit(document, {
    Field: (node) => {
      fields.add(node.name.value);
    },
  });
  return fields;
}

/**
 * The server withholds the solution data from participants until it is
 * published, so the documents participants run do not ask for it at all.
 */
describe('participant documents', () => {
  const documents: [string, DocumentNode][] = [
    [
      'QuestionnairePublishedContentsByQuestionnaireId',
      QuestionnairePublishedContentsByQuestionnaireIdDocument,
    ],
    ['QuestionnaireContentUpdated', QuestionnaireContentUpdatedDocument],
  ];

  for (const [name, document] of documents) {
    it(`leave the correct answer count out of ${name}`, () => {
      const fields = selectedFields(document);

      expect(fields.has('correctAnswerCount')).toBeFalse();
      // The contents are selected at all, so the check is not vacuous.
      expect(fields.has('answerCount') || fields.has('body')).toBeTrue();
    });
  }
});
