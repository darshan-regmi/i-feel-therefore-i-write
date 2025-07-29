// lib/firebaseAdmin.ts
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "i-feel-therefore-i-write",
      clientEmail: "firebase-adminsdk-fbsvc@i-feel-therefore-i-write.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDL3RCLQLtPeQao\nEBVitznK7tkO4IOJJCZrwwo+IwUhuzhUhK8bc1bUhuJtPjhaBxKQQyFbJHzNQB35\nN+eUVSyGo0l3FkvtdbNN2XZQLIrR/4wKwzFQNjg9KeZLh8qjw9jJgFLmYnCel0xw\nY2tkF8AlHoWiIO0rMrTy++HoQMQ1WqGw46ivIiiFOLvKjaNeZEVLJOwZbZgbN3H1\nusy2LHtWod02hfdfi0pNqqFqG6lS+F6ZvytgF4muEG5QYm9eqwd6i/ix1bPGHOlO\nBJrYJ+4vER0YVwn1Yywb9646+Wmgkn2020yf8iprnqs7a5KAGsafDJSOWp9FbP4l\n2zMbExqnAgMBAAECggEAW1o2+SerJ/w0OuhmJOO1LpYkRxHdb313CBAQzXJU8N4b\n6mfArfzb2oWM/mYEy3bi3yltz5FEqZcDN3PRPruCJd0S5R3lLUXycL6zUU78cAjj\nAMmiFe8N+X6Gl68EY6k1wmnR/DH9hFuJIc2zSFmKPTf1qwa1MIfa5Q1xGGm5Yqxq\nQeV8wjMgBEi35Bs1K3oVOSBFlR82jO78siRKcr4NNwu9tp4DIODbfKltc/ucvVei\njwuTTgOhlO5GiTqVfL7dnPCAh6npbQGTu0plp2uz7D1i8jHFaEbrdhG7mINDUaBK\n2JoAy82rzSNyRNsg8Pu1lGKmPCa0KAvRufjIG2BhDQKBgQD5e4rslu1JX17NztxI\n/03hwxkT1kNDeyewvzoY76efnBgSAn7vmqqNAxWzD+AdBAUihL3/WhszGnx/BQbr\n9aSsJRm5LkgzfF4XhGZohJ4RNFq9YL+TllbbQxCMq+fdNuUhstIPQx+GEpRm0hP4\n0hCmGWSP1iBnNkQkPlJcmDmFxQKBgQDRMG/Ov2Awg6U7rRBCHC5tyicP6dNMHtNY\nDqKW2g3Vy7qSj4U3nAwJ3MKHgRslBQex07QWeVBRbbCuAwawg50C+XHegiHiFg2H\nVNnchD8mb0VKGRYczovCDV+1jlQt48JssGfr7LHeesXwW7+s/voI4WSul4V1RwGJ\n+YE6KfLRewKBgGzrJufLrKTP4k/v8/RaoeHij1w9uvgHGHjtw6uHVaM1Prz+IfTx\njWwq4JpgX/PLAYLkeR62dBGHirrZsv/pKo+NUwGp1xPDRED4KM2QuIHCXas4Retl\nQ15OlTcVBhFqGfbwXw0SvPyHuAp7xQRokaQyidjSHytwYaeBHewW+WYRAoGAJM/+\nTQbWmZMBJ+BLxSaKcR2rBBzk5zdhf9SLfjp/RslkWthQ3Dlk0PN9dDUfHsOk2AFm\nZrIQlVPVTLoRmkx+/AADruF9rvishs1CzZCkQFJCgkip4IXkiFCsMBoM7Epxc4kT\nsKvlnT5DyQmMUJhKTffELQlTHhFRzwMOX7r0FTMCgYEAvfEvGERmKW+fqK9xSJ8o\nlY4d2HBx82Dd+PjCotY+CBJWI0mVcvajZ7HLBej/NXsLlZi5UYLIXRofv3yF7Y/I\nRj9rd8lHLAElOGPiNo9/CTIDgUBgO6cYFEiN5dq3fMOzUQzc6LmhsTVYvi+QRpZ2\nLBNl6GG4ChiwlOPyVBSOl3c=\n-----END PRIVATE KEY-----\n",
    }),
  });
}

const db = admin.firestore();

export { db };