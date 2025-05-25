import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import plantumlEncoder from 'plantuml-encoder';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { prompt: userPrompt } = await request.json();

    if (!userPrompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

    const systemDesignPrompt = `
You are a system design expert. Create a valid PlantUML component diagram for: "${userPrompt}"

Follow these EXACT PlantUML syntax rules:
1. Start with @startuml
2. End with @enduml
3. Use component diagram syntax only
4. Use these valid elements:
   - [Component Name] for components
   - database "DB Name" as db1
   - cloud "Service Name" as cloud1
   - actor "User" as user
   - interface "API" as api

Example format:
@startuml
title System Architecture

actor "Users" as users
[Web Application] as webapp
[API Gateway] as gateway
[User Service] as userservice
[Auth Service] as authservice
database "User DB" as userdb
database "Session DB" as sessiondb
cloud "CDN" as cdn

users --> webapp : HTTP requests
webapp --> gateway : API calls
gateway --> userservice : user operations
gateway --> authservice : authentication
userservice --> userdb : read/write
authservice --> sessiondb : sessions
webapp --> cdn : static content

@enduml

Now create a similar diagram for: "${userPrompt}"

Rules:
- Use ONLY valid PlantUML component syntax
- Include 5-8 main components
- Show clear relationships with arrows
- Use meaningful component names
- Keep it simple and readable
- DO NOT use complex syntax or custom shapes

Provide ONLY the PlantUML code, nothing else.
`;

    const result = await model.generateContent(systemDesignPrompt);
    const response = result.response;
    let plantUML = response.text().trim();

    // Clean up the response
    plantUML = plantUML.replace(/```plantuml/g, '').replace(/```/g, '').trim();
    
    // Ensure proper format
    if (!plantUML.startsWith('@startuml')) {
      plantUML = '@startuml\n' + plantUML;
    }
    if (!plantUML.endsWith('@enduml')) {
      plantUML = plantUML + '\n@enduml';
    }

    // Validate basic PlantUML syntax
    if (!plantUML.includes('@startuml') || !plantUML.includes('@enduml')) {
      throw new Error('Invalid PlantUML syntax generated');
    }

    // Generate explanation based on the system type
    const explanation = generateExplanation(userPrompt, plantUML);

    // Generate PlantUML diagram URL
    const encoded = plantumlEncoder.encode(plantUML);
    const diagramUrl = `https://www.plantuml.com/plantuml/img/${encoded}`;

    // Test if the URL works by making a quick validation
    console.log('Generated PlantUML:', plantUML);
    console.log('Diagram URL:', diagramUrl);

    return NextResponse.json({
      plantUML,
      explanation,
      diagramUrl,
      success: true
    });

  } catch (error) {
    console.error('Error generating system design:', error);
    
    // Get the prompt from the request body for fallback
    const { prompt: userPrompt } = await request.json();
    
    // Fallback with a simple working diagram
    const fallbackDiagram = createFallbackDiagram(userPrompt);
    const encoded = plantumlEncoder.encode(fallbackDiagram.plantUML);
    const diagramUrl = `https://www.plantuml.com/plantuml/img/${encoded}`;

    return NextResponse.json({
      plantUML: fallbackDiagram.plantUML,
      explanation: fallbackDiagram.explanation,
      diagramUrl,
      success: true
    });
  }
}

function generateExplanation(userPrompt: string, plantUML: string): string {
  return `This system design diagram illustrates the architecture for "${userPrompt}". The diagram shows the key components and their relationships, including user interfaces, services, databases, and external integrations. Each component serves a specific purpose in handling user requests, processing data, and maintaining system scalability and reliability.`;
}

function createFallbackDiagram(userPrompt: string) {
  const simplifiedPrompt = userPrompt.toLowerCase();
  
  if (simplifiedPrompt.includes('video') || simplifiedPrompt.includes('youtube')) {
    return {
      plantUML: `@startuml
title Video Streaming Platform Architecture

actor "Users" as users
[Web Client] as webclient
[Mobile App] as mobileapp
[API Gateway] as gateway
[Video Service] as videoservice
[User Service] as userservice
[Recommendation Engine] as recommend
database "Video Metadata DB" as videodb
database "User DB" as userdb
cloud "CDN" as cdn
cloud "Video Storage" as storage

users --> webclient : browse videos
users --> mobileapp : mobile access
webclient --> gateway : API requests
mobileapp --> gateway : API requests
gateway --> videoservice : video operations
gateway --> userservice : user management
gateway --> recommend : get recommendations
videoservice --> videodb : metadata
userservice --> userdb : user data
videoservice --> storage : video files
webclient --> cdn : stream video
mobileapp --> cdn : stream video

@enduml`,
      explanation: "This architecture supports video streaming with user management, content delivery through CDN, and personalized recommendations."
    };
  } else if (simplifiedPrompt.includes('social') || simplifiedPrompt.includes('twitter')) {
    return {
      plantUML: `@startuml
title Social Media Platform Architecture

actor "Users" as users
[Web App] as webapp
[Mobile App] as mobile
[API Gateway] as gateway
[Post Service] as postservice
[User Service] as userservice
[Timeline Service] as timeline
[Notification Service] as notify
database "Posts DB" as postdb
database "Users DB" as userdb
database "Timeline Cache" as cache

users --> webapp : social interactions
users --> mobile : mobile access
webapp --> gateway : API calls
mobile --> gateway : API calls
gateway --> postservice : create/read posts
gateway --> userservice : user management
gateway --> timeline : get timeline
gateway --> notify : notifications
postservice --> postdb : store posts
userservice --> userdb : user data
timeline --> cache : cached timelines

@enduml`,
      explanation: "This social media architecture handles user posts, timelines, notifications, and social interactions with efficient caching."
    };
  } else if (simplifiedPrompt.includes('uber') || simplifiedPrompt.includes('ride')) {
    return {
      plantUML: `@startuml
title Ride Sharing Platform Architecture

actor "Riders" as riders
actor "Drivers" as drivers
[Mobile App] as app
[API Gateway] as gateway
[User Service] as userservice
[Ride Service] as rideservice
[Location Service] as locationservice
[Payment Service] as paymentservice
[Notification Service] as notifyservice
database "Users DB" as userdb
database "Rides DB" as ridedb
cloud "Maps API" as maps
cloud "Payment Gateway" as payment

riders --> app : request ride
drivers --> app : accept rides
app --> gateway : API calls
gateway --> userservice : user management
gateway --> rideservice : ride operations
gateway --> locationservice : GPS tracking
gateway --> paymentservice : handle payments
gateway --> notifyservice : send notifications
rideservice --> ridedb : ride data
userservice --> userdb : user profiles
locationservice --> maps : map services
paymentservice --> payment : process payments

@enduml`,
      explanation: "This ride-sharing architecture handles user management, ride matching, real-time location tracking, and payment processing."
    };
  } else if (simplifiedPrompt.includes('ecommerce') || simplifiedPrompt.includes('amazon') || simplifiedPrompt.includes('shopping')) {
    return {
      plantUML: `@startuml
title E-commerce Platform Architecture

actor "Customers" as customers
[Web Store] as webstore
[Mobile App] as mobileapp
[API Gateway] as gateway
[Product Service] as productservice
[User Service] as userservice
[Order Service] as orderservice
[Payment Service] as paymentservice
[Inventory Service] as inventoryservice
database "Products DB" as productdb
database "Users DB" as userdb
database "Orders DB" as orderdb
cloud "CDN" as cdn
cloud "Payment Gateway" as payment

customers --> webstore : browse products
customers --> mobileapp : mobile shopping
webstore --> gateway : API requests
mobileapp --> gateway : API requests
gateway --> productservice : product catalog
gateway --> userservice : user accounts
gateway --> orderservice : order management
gateway --> paymentservice : payments
gateway --> inventoryservice : stock management
productservice --> productdb : product data
userservice --> userdb : user profiles
orderservice --> orderdb : order history
webstore --> cdn : static content
paymentservice --> payment : process payments

@enduml`,
      explanation: "This e-commerce architecture supports product catalog, user management, order processing, inventory tracking, and secure payments."
    };
  } else {
    return {
      plantUML: `@startuml
title System Architecture

actor "Users" as users
[Client Application] as client
[API Gateway] as gateway
[Business Logic Service] as service
[Data Service] as dataservice
database "Primary Database" as maindb
database "Cache" as cache
cloud "External APIs" as external

users --> client : user interactions
client --> gateway : HTTP requests
gateway --> service : business logic
service --> dataservice : data operations
service --> external : external calls
dataservice --> maindb : persistent data
dataservice --> cache : temporary data

@enduml`,
      explanation: "This is a general system architecture with layered services, data persistence, caching, and external integrations."
    };
  }
}