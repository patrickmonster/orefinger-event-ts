export interface Container {
    DockerId: string;
    Name: string;
    DockerName: string;
    Image: string;
    ImageID: string;
    Labels: {};
    DesiredStatus: string;
    KnownStatus: string;
    Limits: any;
    CreatedAt: string;
    StartedAt: string;
    Type: string;
    Networks: any[];
    Health: any;
}

export interface Limits {
    CPU: number;
    Memory: number;
}

export interface ECStask {
    Cluster: string;
    TaskARN: string;
    Family: string;
    Revision: string;
    DesiredStatus: string;
    KnownStatus: string;
    Containers: Container[];
    Limits: Limits;
    PullStartedAt: string;
    PullStoppedAt: string;
    AvailabilityZone: string;
}
