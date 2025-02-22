export type Auth =
	| { type: "root"; username: string; password: string }
	| {
			type: "database";

			namespace: string;
			database: string;

			username: string;
			password: string;
	  }
	| {
			type: "namespace";

			namespace: string;

			username: string;
			password: string;
	  }
	| { type: "token"; token: string };
