<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [firefish-js](./firefish-js.md) &gt; [entities](./firefish-js.entities.md) &gt; [Page](./firefish-js.entities.page.md)

## entities.Page type

**Signature:**

```typescript
export declare type Page = {
	id: ID;
	createdAt: DateString;
	updatedAt: DateString;
	userId: User["id"];
	user: User;
	content: Record<string, any>[];
	variables: Record<string, any>[];
	title: string;
	name: string;
	summary: string | null;
	hideTitleWhenPinned: boolean;
	alignCenter: boolean;
	font: string;
	script: string;
	eyeCatchingImageId: DriveFile["id"] | null;
	eyeCatchingImage: DriveFile | null;
	attachedFiles: any;
	likedCount: number;
	isLiked?: boolean;
};
```
**References:** [ID](./firefish-js.entities.id.md)<!-- -->, [DateString](./firefish-js.entities.datestring.md)<!-- -->, [User](./firefish-js.entities.user.md)<!-- -->, [DriveFile](./firefish-js.entities.drivefile.md)
