-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "context" TEXT NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT[],
    "publishedAt" DATE NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeforeAfterCase" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sessions" TEXT NOT NULL,
    "recovery" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "hasConsent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BeforeAfterCase_pkey" PRIMARY KEY ("id")
);
